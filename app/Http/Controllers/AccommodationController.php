<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Room;
use App\Models\Booking;
use App\Models\RoomCleaningLog;
use Carbon\Carbon;

class AccommodationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX (Room Monitoring with Date Logic)
    |--------------------------------------------------------------------------
    */
    public function index(Request $request)
    {
        $start = $request->get('start')
            ? Carbon::parse($request->get('start'))->toDateString()
            : Carbon::today()->toDateString();

        $end = $request->get('end')
            ? Carbon::parse($request->get('end'))->toDateString()
            : Carbon::today()->addDay()->toDateString();

        $rooms = Room::select(
            'id',
            'room_number',
            'room_type',
            'capacity',
            'price',
            'description',
            'status'
        )->get();

        $roomsTransformed = $rooms->map(function ($room) use ($start, $end) {

            /*
        |----------------------------------------------------------
        | Get booking overlapping the selected range
        |
        | booking.check_in <= selected_end
        | booking.check_out > selected_start
        |
        | This detects ANY overlap with the selected stay period
        */

            $booking = Booking::where('room_id', $room->id)
                ->whereDate('check_in', '<=', $end)
                ->whereDate('check_out', '>', $start)
                ->whereNotIn('status', ['cancelled', 'checked_out'])
                ->orderByDesc('created_at')
                ->first();

            /*
|----------------------------------------------------------
| FINAL ROOM STATUS (Simplified for UI)
|----------------------------------------------------------
| Maintenance
| Occupied
| Reserved
| Available
*/
            if ($room->status === 'maintenance') {

                $finalStatus = 'Maintenance';
            } elseif ($booking) {

                $bookingStatus = strtolower($booking->status);

                if ($bookingStatus === 'checked_in') {

                    $finalStatus = 'Occupied';
                } elseif (in_array($bookingStatus, ['reserved', 'pencil'])) {

                    $finalStatus = 'Reserved';
                } else {

                    $finalStatus = 'Available';
                }
            } else {

                $finalStatus = 'Available';
            }

            return [
                'id' => $room->id,
                'roomNumber' => $room->room_number,
                'category' => $room->room_type,
                'capacity' => (int) $room->capacity,
                'beds' => $room->description ?? '',
                'status' => $finalStatus,
                'price' => $room->price,
            ];
        });

        return Inertia::render('Accommodations/Index', [
            'rooms' => $roomsTransformed,
            'startDate' => $start,
            'endDate' => $end,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | OPERATIONAL STATUS ONLY (available / cleaning / maintenance)
    |--------------------------------------------------------------------------
    */
    public function updateStatus(Request $request, Room $room)
    {
        $request->validate([
            'status' => 'required|in:available,cleaning,maintenance'
        ]);

        $status = strtolower($request->status);

        $activeBooking = Booking::where('room_id', $room->id)
            ->whereIn('status', ['reserved', 'checked_in'])
            ->exists();

        if ($activeBooking && $status === 'maintenance') {
            return back()->withErrors('Room has an active booking.');
        }

        $room->status = $status;
        $room->save();

        return back()->with('success', 'Room operational status updated.');
    }

    /*
    |--------------------------------------------------------------------------
    | CONFIRM CLEANING (Cleaning → Available + Log)
    |--------------------------------------------------------------------------
    */
    public function confirmCleaning(Room $room)
    {
        if ($room->status !== 'cleaning') {
            return back()->withErrors('Room is not in cleaning state.');
        }

        RoomCleaningLog::create([
            'room_id' => $room->id,
            'started_at' => now(),
            'completed_at' => now(),
        ]);

        $room->status = 'available';
        $room->save();

        return back()->with('success', 'Room cleaned and available.');
    }

    /*
|--------------------------------------------------------------------------
| STORE NEW ROOM
|--------------------------------------------------------------------------
*/
    public function store(Request $request)
    {
        $request->validate([
            'room_number' => 'required|unique:rooms,room_number',
            'room_type' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        Room::create([
            'room_number' => $request->room_number,
            'room_type' => $request->room_type,
            'capacity' => $request->capacity,
            'price' => $request->price,
            'description' => $request->description,
            'status' => 'available',
        ]);

        return back()->with('success', 'Room added successfully.');
    }

    /*
|--------------------------------------------------------------------------
| UPDATE ROOM
|--------------------------------------------------------------------------
*/
    public function update(Request $request, Room $room)
    {
        $request->validate([
            'room_number' => 'required|string|max:50|unique:rooms,room_number,' . $room->id,
            'room_type' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $room->update([
            'room_number' => $request->room_number,
            'room_type' => $request->room_type,
            'capacity' => $request->capacity,
            'price' => $request->price,
            'description' => $request->description,
        ]);

        return back()->with('success', 'Room updated successfully.');
    }


    /*
|--------------------------------------------------------------------------
| DELETE ROOM
|--------------------------------------------------------------------------
*/
    public function destroy(Room $room)
    {
        $hasBookings = Booking::where('room_id', $room->id)->exists();

        if ($hasBookings) {
            return back()->withErrors('Cannot delete a room with existing bookings.');
        }

        $room->delete();

        return back()->with('success', 'Room deleted successfully.');
    }
}
