<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingType;
use App\Models\Charge;
use App\Models\Rate;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RatesController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->get('start')
            ? Carbon::parse($request->get('start'))->toDateString()
            : null;

        $end = $request->get('end')
            ? Carbon::parse($request->get('end'))->toDateString()
            : null;

        return Inertia::render('Rates/Index', [
            'rates' => Rate::query()
                ->where('is_custom', false)
                ->orderBy('value')
                ->get(),
            'charges' => Charge::query()
                ->where('is_custom', false)
                ->orderBy('value')
                ->get(),
            'bookingTypes' => BookingType::orderBy('name')->get(),
            'chartRates' => Rate::query()
                ->where('is_custom', false)
                ->withCount([
                    'bookings' => fn ($query) => $this->applyDateRange($query, $start, $end),
                ])
                ->orderBy('value')
                ->get(),
            'chartStats' => [
                'totalBookings' => $this->applyDateRange(Booking::query(), $start, $end)->count(),
            ],
            'chartDiscounts' => Rate::query()
                ->where('type', 'percentage')
                ->where('is_custom', false)
                ->orderBy('value')
                ->with([
                    'bookings' => fn ($query) => $this->applyDateRange($query, $start, $end),
                ])
                ->get()
                ->map(function (Rate $rate): array {
                    $totalDiscount = $rate->bookings->sum(
                        fn (Booking $booking): float => (float) ($booking->discount_amount ?? 0)
                    );

                    return [
                        'id' => $rate->id,
                        'name' => $rate->name,
                        'value' => $rate->value,
                        'totalDiscount' => round($totalDiscount, 2),
                    ];
                }),
        ]);
    }

    private function applyDateRange(Builder|Relation $query, ?string $start, ?string $end): Builder|Relation
    {
        if (! $start || ! $end) {
            return $query;
        }

        return $query
            ->whereDate('check_in', '<=', $end)
            ->whereDate('check_out', '>', $start);
    }

    // Rate Methods
    public function storeRate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'value' => 'required|numeric|min:0',
            'type' => 'required|in:fixed,percentage',
        ]);

        Rate::create($validated);

        return redirect()->route('rates.index')
            ->with('success', 'Rate created successfully.');
    }

    public function updateRate(Request $request, Rate $rate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'value' => 'required|numeric|min:0',
            'type' => 'required|in:fixed,percentage',
        ]);

        $rate->update($validated);

        return redirect()->route('rates.index')
            ->with('success', 'Rate updated successfully.');
    }

    public function destroyRate(Rate $rate)
    {
        $rate->delete();

        return redirect()->route('rates.index')
            ->with('success', 'Rate deleted successfully.');
    }

    // Charge Methods
    public function storeCharge(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'value' => 'required|numeric|min:0',
            'type' => 'required|in:amenity,damage',
        ]);

        Charge::create($validated);

        return redirect()->route('rates.index')
            ->with('success', 'Charge created successfully.');
    }

    public function updateCharge(Request $request, Charge $charge)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'value' => 'required|numeric|min:0',
            'type' => 'required|in:amenity,damage',
        ]);

        $charge->update($validated);

        return redirect()->route('rates.index')
            ->with('success', 'Charge updated successfully.');
    }

    public function destroyCharge(Charge $charge)
    {
        $charge->delete();

        return redirect()->route('rates.index')
            ->with('success', 'Charge deleted successfully.');
    }

    // Booking Type Methods
    public function storeBookingType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        BookingType::create($validated);

        return redirect()->route('rates.index')
            ->with('success', 'Booking type created successfully.');
    }

    public function updateBookingType(Request $request, BookingType $bookingType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $bookingType->update($validated);

        return redirect()->route('rates.index')
            ->with('success', 'Booking type updated successfully.');
    }

    public function destroyBookingType(BookingType $bookingType)
    {
        if ($bookingType->bookings()->exists()) {
            return back()->with('error', 'Cannot delete booking type that is in use.');
        }

        $bookingType->delete();

        return redirect()->route('rates.index')
            ->with('success', 'Booking type deleted successfully.');
    }
}
