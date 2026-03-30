<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index()
    {
        $bookings = Booking::with([
            'client',
            'room',
            'payments',
            'bookingCharges',
        ])
            ->whereIn('status', ['checked_out', 'no_show', 'cancelled'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('reports/history', [
            'bookings' => $bookings,
        ]);
    }
}
