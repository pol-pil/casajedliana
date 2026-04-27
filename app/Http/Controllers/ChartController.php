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
        | 📊 BASE DATA
        |--------------------------------------------------------------------------
        */
        $validStatuses = ['confirmed', 'checked_in', 'checked_out'];

        $bookings = Booking::with([
            'bookingCharges',
            'payments',
            'rate'
        ])
            ->whereIn('status', $validStatuses)
            ->get();

        $currentYear = now()->year;

        /*
        |--------------------------------------------------------------------------
        | 💰 MONTHLY REVENUE (DB SAFE)
        |--------------------------------------------------------------------------
        */
        $currentMonth = now()->month;

        $monthly = collect(range(1, $currentMonth))->map(function ($month) use ($bookings, $currentYear) {

            $monthBookings = $bookings->filter(function ($b) use ($month, $currentYear) {
                return $b->check_in->year == $currentYear
                    && $b->check_in->month == $month;
            });

            $revenue = $monthBookings->sum(fn($b) => $b->payments->sum('amount'));

            return [
                'label' => date('M', mktime(0, 0, 0, $month, 1)),
                'revenue' => round($revenue, 2),
            ];
        });

        /*
        |--------------------------------------------------------------------------
        | 💰 YEARLY REVENUE (DB SAFE)
        |--------------------------------------------------------------------------
        */
        $yearly = $bookings
            ->groupBy(fn($b) => $b->check_in->format('Y'))
            ->map(function ($group, $year) {
                return [
                    'label' => (string) $year,
                    'revenue' => $group->sum(fn($b) => $b->payments->sum('amount')),
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | 📊 MONTHLY BOOKINGS (FILTERED)
        |--------------------------------------------------------------------------
        */
        $monthlyBookings = $bookings->filter(
            fn($b) =>
            $b->check_in->year == $currentYear
        );

        /*
        |--------------------------------------------------------------------------
        | 📊 PAYMENTS
        |--------------------------------------------------------------------------
        */
        $monthlyPayments = Payment::whereYear('created_at', $currentYear)
            ->whereHas('booking', function ($q) {
                $q->whereIn('status', ['confirmed', 'checked_in', 'checked_out']);
            })
            ->get();

        $allPayments = Payment::whereHas('booking', function ($q) {
            $q->whereIn('status', ['confirmed', 'checked_in', 'checked_out']);
        })->get();

        /*
        |--------------------------------------------------------------------------
        | 💰 KPI CALCULATOR FUNCTION
        |--------------------------------------------------------------------------
        */
        $calculateKpis = function ($bookingsSet, $paymentsSet) {

            $revenue = $bookingsSet->sum(function ($b) {
                return $b->payments->sum('amount');
            });

            $expected = $bookingsSet->sum(
                fn($b) =>
                $b->total_amount + $b->bookingCharges->sum('total')
            );

            $balance = $bookingsSet->sum(function ($b) {
                $expected = $b->total_amount + $b->bookingCharges->sum('total');
                $paid = $b->payments->sum('amount');
                return max($expected - $paid, 0);
            });

            $cash = Payment::where('payment_method', 'cash')
                ->whereHas('booking', function ($q) {
                    $q->whereIn('status', ['confirmed', 'checked_in', 'checked_out']);
                })
                ->sum('amount');

            $totalRooms = DB::table('rooms')->where('is_active', true)->count();

            $roomNights = $bookingsSet->sum(
                fn($b) => $b->check_in->diffInDays($b->check_out)
            );

            $days = now()->dayOfYear;
            $availableRoomNights = $totalRooms * $days;

            $adr = $roomNights > 0 ? $revenue / $roomNights : 0;

            $occupancy = $availableRoomNights > 0
                ? ($roomNights / $availableRoomNights) * 100
                : 0;

            $revpar = $availableRoomNights > 0
                ? $revenue / $availableRoomNights
                : 0;

            return [
                'revenue' => round($revenue, 2),
                'expected' => round($expected, 2),
                'balance' => round($balance, 2),
                'cash' => round($cash, 2),
                'adr' => round($adr, 2),
                'revpar' => round($revpar, 2),
                'occupancy' => round($occupancy, 2),
            ];
        };

        /*
        |--------------------------------------------------------------------------
        | 📊 KPIs
        |--------------------------------------------------------------------------
        */
        $monthlyKpis = $calculateKpis($monthlyBookings, $monthlyPayments);
        $yearlyKpis = $calculateKpis($bookings, $allPayments);

        /*
        |--------------------------------------------------------------------------
        | 📊 DISTRIBUTION
        |--------------------------------------------------------------------------
        */
        $rates = Rate::all();

        $buildDistribution = function ($bookingSet) use ($rates) {
            return $rates
                ->map(fn($rate) => [
                    'name' => $rate->name,
                    'value' => $bookingSet->where('rate_id', $rate->id)->count(),
                ])
                ->filter(fn($item) => $item['value'] > 0)
                ->values();
        };

        $monthlyDistribution = $buildDistribution($monthlyBookings);
        $yearlyDistribution = $buildDistribution($bookings);

        /*
        |--------------------------------------------------------------------------
        | 🚀 RESPONSE
        |--------------------------------------------------------------------------
        */
        return Inertia::render('reports/charts', [
            'monthlyData' => $monthly,
            'yearlyData' => $yearly,

            'monthlyKpis' => $monthlyKpis,
            'yearlyKpis' => $yearlyKpis,

            'monthlyDistribution' => $monthlyDistribution,
            'yearlyDistribution' => $yearlyDistribution,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 🧠 DB-AGNOSTIC DATE FORMAT
    |--------------------------------------------------------------------------
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
            default => match ($format) { // MySQL / MariaDB
                'Y-m' => "DATE_FORMAT({$column}, '%Y-%m') as {$alias}",
                'Y'   => "DATE_FORMAT({$column}, '%Y') as {$alias}",
            },
        };
    }
}
