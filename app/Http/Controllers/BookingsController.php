<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Client;
use App\Models\Room;
use App\Models\Rate;
use App\Models\Charge;
use App\Models\BookingType;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingsController extends Controller
{
    public function index()
    {
        $bookings = Booking::with([
                'client',
                'room',
                'payments',
                'bookingType',
                'bookingCharges.charge',
                'rate'
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    
        // 🔹 Merge same-name damage charges per booking
        $bookings->getCollection()->transform(function ($booking) {
    
            $booking->bookingCharges = $booking->bookingCharges
                ->groupBy(function ($bc) {
                    return $bc->charge->type === 'damage'
                        ? $bc->charge->name
                        : 'unique_' . $bc->id; // keep non-damage unique
                })
                ->map(function ($group) {
                    $first = $group->first();
    
                    $first->quantity = $group->sum('quantity');
                    $first->total = $group->sum('total');
    
                    return $first;
                })
                ->values();
    
            return $booking;
        });
    
        $stats = [
            'totalBookings' => Booking::count(),
            'activeGuests' => Booking::where('status', 'checked-in')->count(),
            'pendingBookings' => Booking::where('status', 'pending')->count(),
            'totalRevenue' => Booking::sum('total_amount'),
        ];
    
        $rooms = Room::where('status', 'available')->get();
        $rates = Rate::all();
        $charges = Charge::all();
        $clients = Client::all();
        $payments = Payment::all();
        $bookingTypes = BookingType::where('is_active', true)->get();
    
        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'stats' => $stats,
            'rooms' => $rooms,
            'rates' => $rates,
            'charges' => $charges,
            'bookingTypes' => $bookingTypes,
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client' => 'required|array',
            'client.first_name' => 'required|string|max:100',
            'client.last_name' => 'required|string|max:100',
            'client.email' => 'nullable|email|max:60',
            'client.contact_number' => 'required|string|max:20',
            'client.address' => 'nullable|string',
            'client.company' => 'nullable|string',
    
            'room_id' => 'required|exists:rooms,id',
            'rate_id' => 'required|exists:rates,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'guest_count' => 'required|integer|min:1',
            'purpose' => 'nullable|string',
            'booking_type_id' => 'required|exists:booking_types,id',
            'total_amount' => 'required|numeric|min:0',
            'downpayment' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);
    
        // Create or find client
        $client = Client::firstOrCreate(
            ['email' => $validated['client']['email']],
            $validated['client']
        );
    
        // Create booking — use total_amount directly from frontend
        $booking = Booking::create([
            'client_id' => $client->id,
            'room_id' => $validated['room_id'],
            'receptionist_id' => auth()->id(),
            'rate_id' => $validated['rate_id'],
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'guest_count' => $validated['guest_count'],
            'purpose' => $validated['purpose'],
            'booking_type_id' => $validated['booking_type_id'],
            'total_amount' => $validated['total_amount'],
            'remarks' => $validated['remarks'] ?? '',
            'status' => 'pending',
        ]);
    
        // Record downpayment if provided
        if (!empty($validated['downpayment'])) {
            $booking->payments()->create([
                'amount' => $validated['downpayment'],
                'payment_method' => $validated['payment_method'],
                'payment_type' => 'downpayment',
            ]);

            $totalPaid = $booking->payments()->sum('amount');
            $requiredDownpayment = $booking->total_amount * 0.30;
    
            if ($totalPaid >= $requiredDownpayment) {
                $booking->status = 'confirmed';
                $booking->save();
            }
        }
    
        return redirect()->route('bookings.index')
            ->with('success', 'Booking created successfully.');
    }
    

    public function updateStatus(Request $request, Booking $booking)
    {
        $request->validate([
            'status' => 'required|in:confirmed,pending,checked-in,checked-out,cancelled',
        ]);

        $booking->update(['status' => $request->status]);

        return back()->with('success', 'Booking status updated.');
    }

    public function find(Request $request)
{
    return Client::where('first_name', $request->first_name)
        ->where('last_name', $request->last_name)
        ->orWhere('contact_number', $request->contact_number)
        ->first();
}
}