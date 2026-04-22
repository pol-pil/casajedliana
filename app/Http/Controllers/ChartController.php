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
        $validStatuses = ['confirmed', 'checked_in', 'checked_out'];

        $bookings = Booking::with(['bookingCharges', 'payments', 'rate'])
            ->whereIn('status', $validStatuses)
            ->whereYear('check_in', now()->year)
            ->get();

        // -- Monthly Revenue --
        $monthly = Payment::selectRaw($this->dateFormat('created_at', 'Y-m', 'ym') . ', SUM(amount) as revenue')
            ->whereYear('created_at', now()->year)
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->map(function ($row) {
                [$year, $month] = explode('-', $row->ym);
                return [
                    'label'   => date('M', mktime(0, 0, 0, (int) $month, 1)),
                    'revenue' => (float) $row->revenue,
                ];
            });

        // -- Yearly Revenue --
        $yearly = Payment::selectRaw($this->dateFormat('created_at', 'Y', 'year') . ', SUM(amount) as revenue')
            ->groupBy('year')
            ->orderBy('year')
            ->get()
            ->map(fn($row) => [
                'label'   => (string) $row->year,
                'revenue' => (float) $row->revenue,
            ]);

        // -- KPIs --
        $totalRevenue    = Payment::sum('amount');
        $cashPayments    = Payment::where('payment_method', 'cash')->sum('amount');

        $expectedRevenue = $bookings->sum(
            fn($b) => $b->total_amount + $b->bookingCharges->sum('total')
        );

        $balance = $bookings->sum(function ($b) {
            $expected = $b->total_amount + $b->bookingCharges->sum('total');
            return max($expected - $b->payments->sum('amount'), 0);
        });

        // -- Room Metrics --
        $totalRooms          = DB::table('rooms')->where('is_active', true)->count();
        $roomNights          = $bookings->sum(fn($b) => $b->check_in->diffInDays($b->check_out));
        $availableRoomNights = $totalRooms * now()->dayOfYear;

        $adr       = $roomNights > 0          ? $totalRevenue / $roomNights                  : 0;
        $occupancy = $availableRoomNights > 0  ? ($roomNights / $availableRoomNights) * 100  : 0;
        $revpar    = $availableRoomNights > 0  ? $totalRevenue / $availableRoomNights         : 0;

        // -- Client Distribution --
        $clientDistribution = Rate::all()
            ->map(fn($rate) => [
                'name'  => $rate->name,
                'value' => $bookings->where('rate_id', $rate->id)->count(),
            ])
            ->filter(fn($item) => $item['value'] > 0)
            ->values();

        return Inertia::render('reports/charts', [
            'monthlyData'        => $monthly,
            'yearlyData'         => $yearly,
            'clientDistribution' => $clientDistribution,
            'kpis' => [
                'revenue'   => round($totalRevenue, 2),
                'expected'  => round($expectedRevenue, 2),
                'balance'   => round($balance, 2),
                'cash'      => round($cashPayments, 2),
                'adr'       => round($adr, 2),
                'revpar'    => round($revpar, 2),
                'occupancy' => round($occupancy, 2),
            ],
        ]);
    }

    /**
     * Returns a database-agnostic date format expression.
     *
     * @param string $column  The column to format
     * @param string $format  PHP-style format: 'Y-m' or 'Y'
     * @param string $alias   The SQL alias for the result
     */
    private function dateFormat(string $column, string $format, string $alias): string
    {
        $driver = DB::connection()->getDriverName();

        return match (true) {
            $driver === 'sqlite' => match ($format) {
                'Y-m' => "strftime('%Y-%m', {$column}) as {$alias}",
                'Y'   => "strftime('%Y', {$column}) as {$alias}",
            },
            $driver === 'pgsql' => match ($format) {
                'Y-m' => "TO_CHAR({$column}, 'YYYY-MM') as {$alias}",
                'Y'   => "TO_CHAR({$column}, 'YYYY') as {$alias}",
            },
            default => match ($format) { // mysql, mariadb
                'Y-m' => "DATE_FORMAT({$column}, '%Y-%m') as {$alias}",
                'Y'   => "DATE_FORMAT({$column}, '%Y') as {$alias}",
            },
        };
    }
}