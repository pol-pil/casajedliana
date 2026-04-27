<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
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
            'weekday_rate',
            'weekend_rate',
            'description',
            'status'
        )
            ->withCount([
                'bookings as reserved_count' => function ($query) use ($start, $end) {
                    $query->whereDate('check_in', '<=', $end)
                        ->whereDate('check_out', '>', $start)
                        ->whereIn('status', ['pencil', 'confirmed', 'reserved']);
                },

                'bookings as occupied_count' => function ($query) use ($start, $end) {
                    $query->whereDate('check_in', '<=', $end)
                        ->whereDate('check_out', '>', $start)
                        ->where('status', 'checked_in');
                }
            ])
            ->get();

        foreach ($rooms as $room) {

            if (strtolower($room->status) === 'maintenance') {
                $room->status = 'Maintenance';
                continue;
            }

            if ($room->occupied_count > 0) {
                $room->status = 'Occupied';
            } elseif ($room->reserved_count > 0) {
                $room->status = 'Reserved';
            } else {
                $room->status = 'Available';
            }
        }

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

    public function store(StoreRoomRequest $request)
    {
        $validated = $request->validated();

        Room::create([
            'room_number' => $validated['room_number'],
            'room_type' => $validated['room_type'],
            'capacity' => $validated['capacity'],
            'price' => $validated['weekday_rate'],
            'weekday_rate' => $validated['weekday_rate'],
            'weekend_rate' => $validated['weekend_rate'],
            'description' => $validated['description'] ?? null,
            'status' => 'Available',
        ]);

        return back()->with('success', 'Room added successfully.');
    }

    public function update(UpdateRoomRequest $request, Room $room)
    {
        $validated = $request->validated();

        $room->update([
            'room_number' => $validated['room_number'],
            'room_type' => $validated['room_type'],
            'capacity' => $validated['capacity'],
            'price' => $validated['weekday_rate'],
            'weekday_rate' => $validated['weekday_rate'],
            'weekend_rate' => $validated['weekend_rate'],
            'description' => $validated['description'] ?? null,
        ]);

        return back()->with('success', 'Room updated successfully.');
    }

   public function destroy(Room $room)
{
    // Only block deletion if there's an active or upcoming booking
    $activeBookings = Booking::where('room_id', $room->id)
        ->whereIn('status', ['confirmed', 'checked_in', 'reserved'])
        ->exists();

    if ($activeBookings) {
        // We use a key 'message' or 'error' to pass to the frontend
        return back()->withErrors([
            'delete' => 'Cannot delete room: It has an active or upcoming reservation.'
        ]);
    }

    $room->delete();

    return back()->with('success', 'Room deleted successfully.');
}
}
