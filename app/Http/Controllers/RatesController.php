<?php

namespace App\Http\Controllers;

use App\Models\Rate;
use App\Models\Charge;
use App\Models\BookingType;
use App\Models\Booking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RatesController extends Controller
{
    public function index()
    {
        return Inertia::render('Rates/Index', [
            'rates' => Rate::withCount('bookings')->orderBy('created_at', 'desc')->get(),
            'charges' => Charge::orderBy('created_at', 'desc')->get(),
            'bookingTypes' => BookingType::orderBy('name')->get(),
            'stats' => [
                'totalBookings' => Booking::count(),
            ],
        ]);
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