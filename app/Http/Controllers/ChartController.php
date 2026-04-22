<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Rate;

class ChartController extends Controller
{
    public function index()
    {
        /*
        |--------------------------------------------------------------------------
        | 📊 BOOKINGS (for balance + expected)
        |--------------------------------------------------------------------------
        */
        $validStatuses = ['confirmed', 'checked_in', 'checked_out'];

        $bookings = Booking::with([
            'bookingCharges',
            'payments',
            'rate'
        ])
            ->whereIn('status', $validStatuses)
            ->whereYear('check_in', now()->year)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | 💰 MONTHLY REVENUE (REAL CASH FLOW)
        |--------------------------------------------------------------------------
        */
        $monthly = Payment::selectRaw("
                DATE_FORMAT(created_at, '%b') as label,
                MONTH(created_at) as month,
                SUM(amount) as revenue
            ")
            ->whereYear('created_at', now()->year)
            ->groupBy('label', 'month')
            ->orderBy('month')
            ->get()
            ->map(fn($row) => [
                'label' => $row->label,
                'revenue' => (float) $row->revenue,
            ]);

        /*
        |--------------------------------------------------------------------------
        | 💰 YEARLY REVENUE (REAL CASH FLOW)
        |--------------------------------------------------------------------------
        */
        $yearly = Payment::selectRaw("
                YEAR(created_at) as label,
                SUM(amount) as revenue
            ")
            ->groupBy('label')
            ->orderBy('label')
            ->get()
            ->map(fn($row) => [
                'label' => (string) $row->label,
                'revenue' => (float) $row->revenue,
            ]);

        /*
        |--------------------------------------------------------------------------
        | 💰 TOTAL REVENUE (ACTUAL CASH)
        |--------------------------------------------------------------------------
        */
        $totalRevenue = Payment::sum('amount');

        /*
        |--------------------------------------------------------------------------
        | 💰 EXPECTED REVENUE
        |--------------------------------------------------------------------------
        */
        $expectedRevenue = $bookings->sum(function ($b) {
            return $b->total_amount + $b->bookingCharges->sum('total');
        });

        /*
        |--------------------------------------------------------------------------
        | 💰 CASH ONLY
        |--------------------------------------------------------------------------
        */
        $cashPayments = Payment::where('payment_method', 'cash')
            ->sum('amount');

        /*
        |--------------------------------------------------------------------------
        | 💰 BALANCE
        |--------------------------------------------------------------------------
        */
        $balance = $bookings->sum(function ($b) {
            $expected = $b->total_amount + $b->bookingCharges->sum('total');
            $paid = $b->payments->sum('amount');

            return max($expected - $paid, 0);
        });

        /*
        |--------------------------------------------------------------------------
        | 🛏️ ROOM METRICS
        |--------------------------------------------------------------------------
        */
        $totalRooms = DB::table('rooms')
            ->where('is_active', true)
            ->count();

        $roomNights = $bookings->sum(
            fn($b) => $b->check_in->diffInDays($b->check_out)
        );

        $days = now()->dayOfYear;
        $availableRoomNights = $totalRooms * $days;

        /*
        |--------------------------------------------------------------------------
        | 📈 KPIs
        |--------------------------------------------------------------------------
        */
        $adr = $roomNights > 0 ? $totalRevenue / $roomNights : 0;

        $occupancy = $availableRoomNights > 0
            ? ($roomNights / $availableRoomNights) * 100
            : 0;

        $revpar = $availableRoomNights > 0
            ? $totalRevenue / $availableRoomNights
            : 0;

        /*
        |--------------------------------------------------------------------------
        | 📊 CLIENT DISTRIBUTION
        |--------------------------------------------------------------------------
        */
        $rates = Rate::all();

        $clientDistribution = $rates
            ->map(function ($rate) use ($bookings) {
                return [
                    'name' => $rate->name,
                    'value' => $bookings->where('rate_id', $rate->id)->count(),
                ];
            })
            ->filter(fn($item) => $item['value'] > 0)
            ->values();

        /*
        |--------------------------------------------------------------------------
        | 🚀 RESPONSE
        |--------------------------------------------------------------------------
        */
        return Inertia::render('reports/charts', [
            'monthlyData' => $monthly,
            'yearlyData' => $yearly,
            'clientDistribution' => $clientDistribution,
            'kpis' => [
                'revenue' => round($totalRevenue, 2),
                'expected' => round($expectedRevenue, 2),
                'balance' => round($balance, 2),
                'cash' => round($cashPayments, 2),
                'adr' => round($adr, 2),
                'revpar' => round($revpar, 2),
                'occupancy' => round($occupancy, 2),
            ],
        ]);
    }
}
