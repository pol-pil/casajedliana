<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChartController extends Controller
{
    public function index()
    {
        /*
        |--------------------------------------------------------------------------
        | ✅ VALID STATUSES (BASED ON YOUR SYSTEM)
        |--------------------------------------------------------------------------
        */
        $validStatuses = ['confirmed', 'checked_in', 'checked_out'];

        /*
        |--------------------------------------------------------------------------
        | 📊 FETCH BOOKINGS (WITH CHARGES + TYPE)
        |--------------------------------------------------------------------------
        */
        $bookings = Booking::with(['bookingCharges', 'bookingType'])
            ->whereIn('status', $validStatuses)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | 📊 MONTHLY REVENUE (REAL: base + charges)
        |--------------------------------------------------------------------------
        */
        $monthly = $bookings
            ->groupBy(fn($b) => $b->check_in->format('m'))
            ->map(function ($group, $month) {

                $revenue = $group->sum(fn($b) =>
                    $b->total_amount + $b->bookingCharges->sum('total')
                );

                return [
                    'label' => date('M', mktime(0, 0, 0, (int) $month, 1)),
                    'revenue' => (float) $revenue,
                ];
            })
            ->sortBy(fn($item) => date('m', strtotime($item['label'])))
            ->values();

        /*
        |--------------------------------------------------------------------------
        | 📊 YEARLY REVENUE
        |--------------------------------------------------------------------------
        */
        $yearly = $bookings
            ->groupBy(fn($b) => $b->check_in->format('Y'))
            ->map(function ($group, $year) {

                $revenue = $group->sum(fn($b) =>
                    $b->total_amount + $b->bookingCharges->sum('total')
                );

                return [
                    'label' => $year,
                    'revenue' => (float) $revenue,
                ];
            })
            ->sortBy('label')
            ->values();

        /*
        |--------------------------------------------------------------------------
        | 💰 TOTAL REVENUE (REAL)
        |--------------------------------------------------------------------------
        */
        $totalRevenue = $bookings->sum(fn($b) =>
            $b->total_amount + $b->bookingCharges->sum('total')
        );

        /*
        |--------------------------------------------------------------------------
        | 💳 PAYMENTS
        |--------------------------------------------------------------------------
        */
        $totalPayments = DB::table('payments')->sum('amount');

        $cashPayments = DB::table('payments')
            ->where('payment_method', 'cash')
            ->sum('amount');

        $balance = $totalRevenue - $totalPayments;

        /*
        |--------------------------------------------------------------------------
        | 🛏️ ROOM METRICS
        |--------------------------------------------------------------------------
        */
        $totalRooms = DB::table('rooms')
            ->where('is_active', true)
            ->count();

        // Total room nights sold
        $roomNights = $bookings->sum(fn($b) =>
            $b->check_in->diffInDays($b->check_out)
        );

        // Days elapsed this year
        $days = now()->dayOfYear;

        // Total possible room nights
        $availableRoomNights = $totalRooms * $days;

        /*
        |--------------------------------------------------------------------------
        | 📈 KPI CALCULATIONS
        |--------------------------------------------------------------------------
        */

        // ADR = Revenue / Sold Room Nights
        $adr = $roomNights > 0
            ? $totalRevenue / $roomNights
            : 0;

        // Occupancy = Sold Nights / Available Nights
        $occupancy = $availableRoomNights > 0
            ? ($roomNights / $availableRoomNights) * 100
            : 0;

        // RevPAR = Revenue / Available Room Nights
        $revpar = $availableRoomNights > 0
            ? $totalRevenue / $availableRoomNights
            : 0;

        /*
        |--------------------------------------------------------------------------
        | 📊 CLIENT DISTRIBUTION (REAL DATA)
        |--------------------------------------------------------------------------
        */
        $clientDistribution = $bookings
            ->groupBy(fn($b) => $b->bookingType->name ?? 'Unknown')
            ->map(function ($group, $type) {
                return [
                    'name' => $type,
                    'value' => $group->count(),
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | 🚀 RETURN TO FRONTEND
        |--------------------------------------------------------------------------
        */
        return Inertia::render('reports/charts', [
            'monthlyData' => $monthly,
            'yearlyData' => $yearly,
            'clientDistribution' => $clientDistribution,
            'kpis' => [
                'revenue' => round($totalRevenue, 2),
                'payments' => round($totalPayments, 2),
                'balance' => round($balance, 2),
                'cash' => round($cashPayments, 2),
                'adr' => round($adr, 2),
                'revpar' => round($revpar, 2),
                'occupancy' => round($occupancy, 2),
            ],
        ]);
    }
}