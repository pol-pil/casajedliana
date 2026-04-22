<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingCharge;
use App\Models\Charge;
use Illuminate\Http\Request;

class BookingChargesController extends Controller
{
    public function storeBookingCharge(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'charge_id' => 'required',
            'quantity' => 'required|numeric|min:1',
            'value' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'custom_charge_name' => 'nullable|required_if:charge_id,custom|string|max:100',
            'custom_charge_type' => 'nullable|required_if:charge_id,custom|in:amenity,damage',
        ]);

        if ($validated['charge_id'] === 'custom') {
            $charge = Charge::create([
                'name' => $validated['custom_charge_name'],
                'value' => $validated['value'],
                'type' => $validated['custom_charge_type'],
                'is_active' => true,
                'is_custom' => true,
            ]);

            $validated['charge_id'] = $charge->id;
        } else {
            Charge::query()->findOrFail($validated['charge_id']);
        }

        $existing = BookingCharge::where('booking_id', $validated['booking_id'])
            ->where('charge_id', $validated['charge_id'])
            ->first();

        if ($existing) {
            $existing->quantity += $validated['quantity'];
            $existing->total += $validated['total'];
            $existing->save();
        } else {
            BookingCharge::create($validated);
        }

        $booking = Booking::with(['payments', 'bookingCharges'])->find($validated['booking_id']);
        $booking->refreshPaymentStatus();
        $booking->save();

        return redirect()->route('bookings.index')
            ->with('success', 'Booking charge saved successfully.');
    }
}
