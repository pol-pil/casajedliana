<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccommodationController extends Controller
{
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
        )
            ->withCount([
                'bookings as active_bookings_count' => function ($query) use ($start, $end) {
                    $query->whereDate('check_in', '<=', $end)
                        ->whereDate('check_out', '>', $start)
                        ->whereNotIn('status', ['cancelled', 'checked_out', 'no_show']);
                }
            ])
            ->get();

        foreach ($rooms as $room) {

            if (strtolower($room->status) === 'maintenance') {
                continue; 
            }

            if ($room->active_bookings_count > 0) {
                $room->status = 'Reserved'; 
            } else {
                $room->status = 'Available';
            }
        }
        // $roomsTransformed = $rooms->map(function ($room) use ($start, $end) {

        //     $booking = Booking::where('room_id', $room->id)
        //         ->whereDate('check_in', '<=', $end)
        //         ->whereDate('check_out', '>', $start)
        //         // ->whereNotIn('status', ['cancelled', 'checked_out', 'no_show'])
        //         ->orderByDesc('created_at')
        //         ->first();

        //     if ($room->status === 'maintenance') {
        //         $finalStatus = 'Maintenance';
        //     } elseif ($booking) {
        //         $bookingStatus = strtolower($booking->status);

        //         if ($bookingStatus === 'checked_in') {
        //             $finalStatus = 'Occupied';
        //         } elseif (in_array($bookingStatus, ['reserved', 'pencil'])) {
        //             $finalStatus = 'Reserved';
        //         } else {
        //             $finalStatus = 'Available';
        //         }
        //     } else {
        //         $finalStatus = 'Available';
        //     }

        //     return [
        //         'id' => $room->id,
        //         'roomNumber' => $room->room_number,
        //         'category' => $room->room_type,
        //         'capacity' => (int) $room->capacity,
        //         'beds' => $room->description ?? '',
        //         'status' => $finalStatus,
        //         'price' => $room->price,
        //     ];
        // });

        return Inertia::render('Accommodations/Index', [
            'rooms' => $rooms,
            'startDate' => $start,
            'endDate' => $end,
        ]);
    }

    public function updateStatus(Request $request, Room $room)
    {
        $request->validate([
            'status' => 'required|in:Available,Maintenance',
        ]);

        $status = $request->status;

        $activeBooking = Booking::where('room_id', $room->id)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->exists();

        if ($activeBooking && $status === 'Maintenance') {
            return back()->withErrors([
                'status' => 'Room has an active booking.'
            ]);
        }

        $room->status = $status;
        $room->save();

        return back()->with('success', 'Room operational status updated.');
    }

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
            'status' => 'Available',
        ]);

        return back()->with('success', 'Room added successfully.');
    }

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
