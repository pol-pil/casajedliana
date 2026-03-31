<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index()
    {
        $search = request('search');

        $bookings = Booking::with([
            'client',
            'room',
            'payments',
            'bookingCharges',
        ])
            ->when($search, function ($query, $search) {
                $query->whereHas('client', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('reports/history', [
            'bookings' => $bookings,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
