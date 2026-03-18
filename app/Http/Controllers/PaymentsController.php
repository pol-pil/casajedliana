<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;

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

        $requiredDownpayment = $booking->total_amount * 0.50;

        if ($totalPaid > 1) {
            $booking->payment_status = 'partial';
            $booking->save();
        }

        if ($totalPaid >= $booking->total_amount) {
            $booking->payment_status = 'paid';
            $booking->save();
        }

        if ($totalPaid >= $requiredDownpayment) {
            $booking->status = 'confirmed';
            $booking->save();
        }

        return redirect()->route('bookings.index')
            ->with('success', 'Payment added successfully.');
    }
}
