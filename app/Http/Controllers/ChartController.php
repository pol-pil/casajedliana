<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChartController extends Controller
{
    public function index()
    {
        // Monthly revenue
        $monthly = Booking::select(
            DB::raw('MONTH(check_in) as month'),
            DB::raw('SUM(total_amount) as revenue')
        )
            ->whereYear('check_in', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($item) => [
                'label' => date('M', mktime(0, 0, 0, $item->month, 1)),
                'revenue' => (float) $item->revenue,
            ]);

        // Yearly revenue
        $yearly = Booking::select(
            DB::raw('YEAR(check_in) as year'),
            DB::raw('SUM(total_amount) as revenue')
        )
            ->groupBy('year')
            ->orderBy('year')
            ->get()
            ->map(fn($item) => [
                'label' => (string) $item->year,
                'revenue' => (float) $item->revenue,
            ]);

        // KPIs
        $totalBookings = Booking::count();
        $totalRevenue = Booking::sum('total_amount');
        $totalPayments = DB::table('payments')->sum('amount');

        $balance = $totalRevenue - $totalPayments;

        $totalRooms = DB::table('rooms')->count();
        $occupied = Booking::where('status', 'checked_in')->count();

        $adr = $totalBookings > 0 ? $totalRevenue / $totalBookings : 0;
        $revpar = $totalRooms > 0 ? $totalRevenue / $totalRooms : 0;
        $occupancy = $totalRooms > 0 ? ($occupied / $totalRooms) * 100 : 0;

        return Inertia::render('reports/charts', [
            'monthlyData' => $monthly,
            'yearlyData' => $yearly,
            'kpis' => [
                'revenue' => round($totalRevenue, 2),
                'payments' => round($totalPayments, 2),
                'balance' => round($balance, 2),
                'cash' => round($totalPayments, 2),
                'adr' => round($adr, 2),
                'revpar' => round($revpar, 2),
                'occupancy' => round($occupancy, 2),
            ],
        ]);
    }
}