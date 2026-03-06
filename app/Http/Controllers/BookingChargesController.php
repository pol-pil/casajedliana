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
    
        // Check if same charge already exists in this booking
        $existing = BookingCharge::where('booking_id', $validated['booking_id'])
            ->where('charge_id', $validated['charge_id'])
            ->first();
    
        if ($existing) {
            // Merge quantities & totals
            $existing->quantity += $validated['quantity'];
            $existing->total += $validated['total'];
            $existing->save();
        } else {
            // Create new if not existing
            BookingCharge::create($validated);
        }
    
        return redirect()->route('bookings.index')
            ->with('success', 'Booking charge saved successfully.');
    }
}
