<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Booking;
use Inertia\Inertia;

class PaymentsController extends Controller
{
    public function storePayment(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|max:100',
            'payment_type' => 'required|string|max:100',
        ]);

        $payment = Payment::create($validated);

        $booking = Booking::with('payments')->find($validated['booking_id']);

        $totalPaid = $booking->payments->sum('amount');

        $requiredDownpayment = $booking->total_amount * 0.30;

        if ($totalPaid >= $requiredDownpayment) {
            $booking->status = 'confirmed';
            $booking->save();
        }

        return redirect()->route('bookings.index')
            ->with('success', 'Payment added successfully.');
    }
}
