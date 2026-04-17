<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChartController extends Controller
{
    public function index()
    {
        // ✅ VALID BOOKINGS ONLY (adjust if needed)
        $validStatuses = ['checked_in', 'checked_out'];

        /*
        |--------------------------------------------------------------------------
        | 📊 MONTHLY REVENUE
        |--------------------------------------------------------------------------
        */
        $monthly = Booking::select(
            DB::raw("MONTH(check_in) as month"),
            DB::raw('SUM(total_price) as revenue')
        )
            ->whereYear('check_in', now()->year)
            ->whereIn('status', $validStatuses)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'label' => date('M', mktime(0, 0, 0, (int) $item->month, 1)),
                'revenue' => (float) $item->revenue,
            ]);

        /*
        |--------------------------------------------------------------------------
        | 📊 YEARLY REVENUE
        |--------------------------------------------------------------------------
        */
        $yearly = Booking::select(
            DB::raw("YEAR(check_in) as year"),
            DB::raw('SUM(total_price) as revenue')
        )
            ->whereIn('status', $validStatuses)
            ->groupBy('year')
            ->orderBy('year')
            ->get()
            ->map(fn($item) => [
                'label' => $item->year,
                'revenue' => (float) $item->revenue,
            ]);

        /*
        |--------------------------------------------------------------------------
        | 💰 CORE KPIs
        |--------------------------------------------------------------------------
        */
        $totalRevenue = Booking::whereIn('status', $validStatuses)
            ->sum('total_price');

        $totalPayments = DB::table('payments')->sum('amount');

        $balance = $totalRevenue - $totalPayments;

        /*
        |--------------------------------------------------------------------------
        | 🛏️ ROOM & STAY METRICS
        |--------------------------------------------------------------------------
        */

        $totalRooms = DB::table('rooms')->count();

        // Total room nights sold
        $roomNights = Booking::whereIn('status', $validStatuses)
            ->select(DB::raw('SUM(DATEDIFF(check_out, check_in)) as nights'))
            ->value('nights') ?? 0;

        // Total days (for current year)
        $days = now()->dayOfYear;

        $availableRoomNights = $totalRooms * $days;

        /*
        |--------------------------------------------------------------------------
        | 📈 METRICS
        |--------------------------------------------------------------------------
        */

        // ADR = Revenue / Room Nights
        $adr = $roomNights > 0 ? $totalRevenue / $roomNights : 0;

        // Occupancy = Sold Nights / Available Nights
        $occupancy = $availableRoomNights > 0
            ? ($roomNights / $availableRoomNights) * 100
            : 0;

        // RevPAR = Revenue / Available Rooms
        $revpar = $availableRoomNights > 0
            ? $totalRevenue / $availableRoomNights
            : 0;

        return Inertia::render('reports/charts', [
            'monthlyData' => $monthly,
            'yearlyData' => $yearly,
            'kpis' => [
                'revenue' => round($totalRevenue, 2),
                'payments' => round($totalPayments, 2),
                'balance' => round($balance, 2),
                'cash' => round($totalPayments, 2), // refine later by payment method
                'adr' => round($adr, 2),
                'revpar' => round($revpar, 2),
                'occupancy' => round($occupancy, 2),
            ],
        ]);
    }
}
