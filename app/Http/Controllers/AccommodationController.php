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
            $date = $request->get('date')
                ? Carbon::parse($request->get('date'))->toDateString()
                : Carbon::today()->toDateString();

            $rooms = Room::all();

            $roomsTransformed = $rooms->map(function ($room) use ($date) {

                // Get overlapping booking for selected date
                $booking = Booking::where('room_id', $room->id)
                    ->whereDate('check_in', '<=', $date)
                    ->whereDate('check_out', '>', $date)
                    ->whereNotIn('status', ['cancelled', 'checked_out'])
                    ->orderByDesc('created_at')
                    ->first();

                /*
                |----------------------------------------------------------
                | PRIORITY ORDER
                |----------------------------------------------------------
                | 1. Maintenance (always override)
                | 2. Booking overlap
                | 3. Cleaning
                | 4. Available
                */

                // 1️⃣ Maintenance overrides everything
                if (strtolower($room->status) === 'maintenance') {

                    $finalStatus = 'Maintenance';

                }
                // 2️⃣ Booking overlap
                elseif ($booking) {

                    switch ($booking->status) {

                        case 'checked_in':
                            $finalStatus = 'Occupied';
                            break;

                        case 'reserved':
                            $finalStatus = 'Reserved';
                            break;

                        case 'pencil':
                            $finalStatus = 'Pencil';
                            break;

                        default:
                            $finalStatus = 'Reserved';
                            break;
                    }

                }
                // 3️⃣ Cleaning (only if no booking)
                elseif (strtolower($room->status) === 'cleaning') {

                    $finalStatus = 'Cleaning';

                }
                // 4️⃣ Default
                else {

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
                'selectedDate' => $date,
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

    // Force lowercase to match ENUM exactly
    $status = strtolower($request->status);

    // Debug temporarily (optional)
    // dd($status);

    $room->status = $status;
    $room->save();

    return back()->with('success', 'Room operational status updated.');
}


    /*
    |--------------------------------------------------------------------------
    | CHECK IN (Reserved → Checked In)
    |--------------------------------------------------------------------------
    */
    public function checkIn(Room $room)
    {
        $booking = Booking::where('room_id', $room->id)
            ->where('status', 'reserved')
            ->latest()
            ->first();

        if (!$booking) {
            return back()->withErrors('No reserved booking found.');
        }

        $booking->status = 'checked_in';
        $booking->save();

        return back()->with('success', 'Guest checked in.');
    }


    /*
    |--------------------------------------------------------------------------
    | CHECK OUT (Checked In → Checked Out + Cleaning)
    |--------------------------------------------------------------------------
    */
    public function checkOut(Room $room)
    {
        $booking = Booking::where('room_id', $room->id)
            ->where('status', 'checked_in')
            ->latest()
            ->first();

        if (!$booking) {
            return back()->withErrors('No active check-in found.');
        }

        $booking->status = 'checked_out';
        $booking->save();

        $room->status = 'cleaning';
        $room->save();

        return back()->with('success', 'Guest checked out. Room set to cleaning.');
    }


    /*
    |--------------------------------------------------------------------------
    | CANCEL BOOKING (Reserved / Pencil → Cancelled)
    |--------------------------------------------------------------------------
    */
    public function cancelBooking(Room $room)
    {
        $booking = Booking::where('room_id', $room->id)
            ->whereIn('status', ['reserved'])
            ->latest()
            ->first();

        if (!$booking) {
            return back()->withErrors('No cancellable booking found.');
        }

        $booking->status = 'cancelled';
        $booking->save();

        return back()->with('success', 'Booking cancelled.');
    }


    /*
    |--------------------------------------------------------------------------
    | MARK PAID (Pencil → Reserved)
    |--------------------------------------------------------------------------
    */
    public function markPaid(Room $room)
    {
        $booking = Booking::where('room_id', $room->id)
            ->where('status', 'pencil')
            ->latest()
            ->first();

        if (!$booking) {
            return back()->withErrors('No pencil booking found.');
        }

        $booking->status = 'reserved';
        $booking->payment_status = 'paid';
        $booking->save();

        return back()->with('success', 'Booking marked as paid and reserved.');
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
}