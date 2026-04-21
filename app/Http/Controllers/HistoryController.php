<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index()
    {
        $search = request('search');
        $start  = request('start', now()->toDateString());
        $end    = request('end', now()->toDateString());
        $status = request('status');
    
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
            ->when($status && $status !== 'all', function ($query) use ($status) {
                $query->where('status', $status);
            })
            ->where(function ($query) use ($start, $end) {
    $query->whereBetween('check_in', [$start . ' 00:00:00', $end . ' 23:59:59'])
          ->orWhereBetween('check_out', [$start . ' 00:00:00', $end . ' 23:59:59'])
          ->orWhere(function ($q) use ($start, $end) {
              $q->where('check_in', '<=', $start . ' 00:00:00')
                ->where('check_out', '>=', $end . ' 23:59:59');
          });
})
            ->orderBy('updated_at', 'desc')
            ->paginate(12)
            ->withQueryString();
    
        return Inertia::render('reports/history', [
            'bookings' => $bookings,
            'filters' => [
                'search' => $search,
                'start'  => $start,
                'end'    => $end,
                'status' => $status,
            ],
        ]);
    }
}
