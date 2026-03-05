<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BookingCharge;
use App\Models\Booking;
use Inertia\Inertia;

class BookingChargesController extends Controller
{
    public function storeBookingCharge(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'charge_id' => 'required|exists:charges,id',
            'quantity' => 'required|numeric|min:1',
            'value' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        $bookingCharge = BookingCharge::create($validated);

        return redirect()->route('bookings.index')
            ->with('success', 'Booking charge added successfully.');
    }
}
