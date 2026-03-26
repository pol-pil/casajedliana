<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
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
                // Count RESERVED-type bookings
                'bookings as reserved_count' => function ($query) use ($start, $end) {
                    $query->whereDate('check_in', '<=', $end)
                        ->whereDate('check_out', '>', $start)
                        ->whereIn('status', ['pencil', 'confirmed', 'reserved']);
                },

                // Count OCCUPIED bookings
                'bookings as occupied_count' => function ($query) use ($start, $end) {
                    $query->whereDate('check_in', '<=', $end)
                        ->whereDate('check_out', '>', $start)
                        ->where('status', 'checked_in');
                }
            ])
            ->get();

        foreach ($rooms as $room) {

            if (strtolower($room->status) === 'maintenance') {
                continue;
            }

            // PRIORITY: Occupied > Reserved > Available
            if ($room->occupied_count > 0) {
                $room->status = 'Occupied';
            } elseif ($room->reserved_count > 0) {
                $room->status = 'Reserved';
            } else {
                $room->status = 'Available';
            }
        }

        $bookings = Booking::with(['client', 'room', 'payments'])
            ->whereDate('check_in', '<=', $end)
            ->whereDate('check_out', '>', $start)
            ->whereNotIn('status', ['cancelled', 'checked_out'])
            ->get();

        $checkIns = Booking::with(['client', 'room', 'payments'])
            ->whereBetween('check_in', [$start, $end])
            ->get();

        $checkOuts = Booking::with(['client', 'room', 'payments'])
            ->whereBetween('check_out', [$start, $end])
            ->get();

        // $roomsTransformed = $rooms->map(function ($room) use ($bookings) {
        //     $booking = $bookings->firstWhere('room_id', $room->id);

        //     if ($room->status === 'maintenance') {
        //         $computedStatus = 'Maintenance';
        //     } elseif ($booking) {
        //         $bookingStatus = strtolower($booking->status);

        //         if ($bookingStatus === 'checked_in') {
        //             $computedStatus = 'Occupied';
        //         } else {
        //             $computedStatus = 'Reserved';
        //         }
        //     } else {
        //         $computedStatus = 'Available';
        //     }

        //     return [
        //         'id' => $room->id,
        //         'room_number' => $room->room_number,
        //         'room_type' => $room->room_type,
        //         'status' => $computedStatus,
        //     ];
        // });

        $computePaymentStatus = function ($booking) {
            $totalPaid = $booking->payments->sum('amount');

            if ($totalPaid <= 0) {
                $booking->payment_status = 'unpaid';
            } elseif ($totalPaid < $booking->total_amount) {
                $booking->payment_status = 'partial';
            } else {
                $booking->payment_status = 'paid';
            }

            return $booking;
        };

        $bookings = $bookings->map($computePaymentStatus);
        $checkIns = $checkIns->map($computePaymentStatus);
        $checkOuts = $checkOuts->map($computePaymentStatus);

        return Inertia::render('Dashboard/Index', [
            'startDate' => $start,
            'endDate' => $end,
            'rooms' => $rooms,
            'bookings' => $bookings,
            'checkIns' => $checkIns,
            'checkOuts' => $checkOuts,
        ]);
    }
}
