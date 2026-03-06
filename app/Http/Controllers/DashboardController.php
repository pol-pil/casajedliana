<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Room;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
   public function index(Request $request)
{
    $date = $request->get('date')
        ? Carbon::parse($request->get('date'))->toDateString()
        : Carbon::today()->toDateString();

    $today = Carbon::today()->toDateString();
    $isToday = $date === $today;

    $rooms = Room::all();

    // All bookings overlapping selected date
    $bookings = Booking::with(['client','room'])
        ->whereDate('check_in', '<=', $date)
        ->whereDate('check_out', '>', $date)
        ->whereNotIn('status', ['cancelled','checked_out'])
        ->get();

    // Separate arrivals & departures
    $checkIns = Booking::with(['client','room'])
        ->whereDate('check_in', $date)
        ->get();

    $checkOuts = Booking::with(['client','room'])
        ->whereDate('check_out', $date)
        ->get();

    // Compute occupied rooms
    $occupiedRoomIds = $bookings->pluck('room_id')->unique();

    $roomsTransformed = $rooms->map(function ($room) use ($bookings, $isToday) {

    $booking = $bookings->firstWhere('room_id', $room->id);

    /*
    |----------------------------------------------------------
    | PRIORITY ORDER (MATCH ROOM MANAGEMENT)
    |----------------------------------------------------------
    | 1. Maintenance
    | 2. Booking overlap
    | 3. Cleaning (today only)
    | 4. Available
    */

    // 1️⃣ Maintenance override
    if (strtolower($room->status) === 'maintenance') {

        $computedStatus = 'Maintenance';

    }
    // 2️⃣ Booking overlap
    elseif ($booking) {

        $status = strtolower($booking->status);

        if ($status === 'checked_in') {
            $computedStatus = 'Occupied';
        } elseif ($status === 'reserved') {
    $computedStatus = 'Reserved';
        } elseif ($status === 'pending') {
            $computedStatus = 'Pending';
        } else {
            $computedStatus = 'Reserved';   
        }

    }
    // 3️⃣ Cleaning only for today
    elseif ($isToday && strtolower($room->status) === 'cleaning') {

        $computedStatus = 'Cleaning';

    }
    // 4️⃣ Default
    else {

        $computedStatus = 'Available';
    }

    return [
        'id' => $room->id,
        'room_number' => $room->room_number,
        'room_type' => $room->room_type,
        'status' => $computedStatus,
    ];
});

    return Inertia::render('Dashboard/Index', [
        'selectedDate' => $date,
        'rooms' => $roomsTransformed,
        'bookings' => $bookings,
        'checkIns' => $checkIns,
        'checkOuts' => $checkOuts,
    ]);
}
}