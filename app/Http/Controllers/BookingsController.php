<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\BookingType;
use App\Models\Charge;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\Room;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class BookingsController extends Controller
{

    private function syncRoomStatus(Booking $booking)
    {
        $room = $booking->room;

        if (!$room) return;

        $status = strtolower($booking->status);

        if (in_array($status, ['pencil', 'confirmed', 'reserved'])) {
            $room->status = 'Reserved';
        } elseif ($status === 'checked_in') {
            $room->status = 'Occupied';
        } elseif (in_array($status, ['checked_out', 'cancelled', 'no_show'])) {
            $room->status = 'Available';
        }

        $room->save();
    }

    public function index(Request $request)
    {
        $start = $request->input('start', Carbon::today()->toDateString());
        $end = $request->input('end', Carbon::today()->toDateString());
        $search = request('search');
        $searchName = request('searchName');

        // Fetch all active bookings once for stats (payments + charges eager-loaded to avoid N+1)
        $allActiveBookings = Booking::whereNotIn('status', ['cancelled', 'checked_out', 'no_show'])
            ->with(['payments', 'bookingCharges'])
            ->get();

        $bookings = Booking::with([
            'client',
            'room',
            'payments',
            'bookingType',
            'bookingCharges.charge',
            'rate',
        ])
            ->when($search, function ($query, $search) {
                $query->whereHas('client', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->whereNotIn('status', ['cancelled', 'checked_out', 'no_show'])
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        $stats = [
            'totalBookings'      => $allActiveBookings->count(),
            'activeGuests'       => $allActiveBookings->where('status', 'checked_in')->count(),
            'pencilBookings'     => $allActiveBookings->where('status', 'pencil')->count(),
            // 'totalRevenue'    => $allActiveBookings->sum('total_amount'),
            'outstandingBalance' => $allActiveBookings->sum(function ($b) {
                $paid         = $b->payments->sum('amount');
                $extraCharges = $b->bookingCharges->sum('total');
                return max(($b->total_amount + $extraCharges) - $paid, 0);
            }),
        ];

        $rooms = Room::orderBy('room_number')->get();
        $rates = Rate::where('is_active', true)->get();
        $charges = Charge::where('is_active', true)->get();
        $clients = Client::when($searchName, function ($query, $searchName) {
            $query->where('first_name', 'like', "%{$searchName}%")
                  ->orWhere('last_name', 'like', "%{$searchName}%");
        })
        ->orderBy('first_name')
        ->get();
        $payments = Payment::all();
        $bookingTypes = BookingType::where('is_active', true)->get();

        $roomBlockedDates = Booking::whereIn('status', ['confirmed', 'pencil', 'checked_in', 'reserved'])
            ->get(['room_id', 'check_in', 'check_out', 'id'])
            ->groupBy('room_id')
            ->map(fn($bookings) => $bookings->map(fn($b) => [
                'from' => Carbon::parse($b->check_in)->toDateString(),
                'to'   => Carbon::parse($b->check_out)->toDateString(),
                'booking_id' => $b->id,
            ])->values());

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'stats' => $stats,
            'rooms' => $rooms,
            'rates' => $rates,
            'charges' => $charges,
            'bookingTypes' => $bookingTypes,
            'clients' => $clients,
            'roomBlockedDates' => $roomBlockedDates,
            'filters' => [
                'search' => $search,
                'searchName' => $searchName,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if ($request->custom_discount && floatval($request->custom_discount) > 0) {
            $rate = Rate::create([
                'name'      => 'Custom Discount',
                'value'     => $request->custom_discount,
                'type'      => $request->custom_discount_type ?? 'percentage',
                'is_active' => true,
                'is_custom' => true,
            ]);
            $request->merge(['rate_id' => $rate->id]);
        }

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
            'payment_method' => 'nullable|required_with:downpayment|string',
            'remarks' => 'nullable|string',
        ]);

        $client = Client::firstOrCreate(
            ['contact_number' => $validated['client']['contact_number']],
            $validated['client']
        );

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
            'payment_status' => ! empty($validated['downpayment']) ? 'partial' : 'unpaid',
            'status' => 'pencil',
        ]);

        $this->syncRoomStatus($booking);

        if (! empty($validated['downpayment'])) {
            $booking->payments()->create([
                'amount' => $validated['downpayment'],
                'payment_method' => $validated['payment_method'],
                'payment_type' => 'downpayment',
            ]);

            $totalPaid = $booking->payments()->sum('amount');
            $requiredDownpayment = $booking->total_amount * 0.50;

            if ($totalPaid >= $requiredDownpayment) {
                $booking->status = 'confirmed';
                $booking->save();

                $this->syncRoomStatus($booking);
            }
            
            if ($totalPaid >= $booking->total_amount) {
                $booking->payment_status = 'paid';
            } elseif ($totalPaid > 0) {
                $booking->payment_status = 'partial';
            } else {
                $booking->payment_status = 'unpaid';
            }

        $booking->save();
        }

        return redirect()->route('bookings.index')
            ->with('success', 'Booking created successfully.');
    }

    public function update(Request $request, Booking $booking)
    {
            if ($request->custom_discount && floatval($request->custom_discount) > 0) {
            $rate = Rate::create([
                'name'      => 'Custom Discount',
                'value'     => $request->custom_discount,
                'type'      => $request->custom_discount_type ?? 'percentage',
                'is_active' => true,
                'is_custom' => true,
            ]);
            $request->merge(['rate_id' => $rate->id]);
        }

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
            'payment_method' => 'nullable|string',
            'remarks' => 'nullable|string',
        ]);

        // Update client
        $booking->client->update($validated['client']);

        // Update booking details
        $booking->update([
            'room_id' => $validated['room_id'],
            'rate_id' => $validated['rate_id'],
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'guest_count' => $validated['guest_count'],
            'purpose' => $validated['purpose'],
            'booking_type_id' => $validated['booking_type_id'],
            'total_amount' => $validated['total_amount'],
            'remarks' => $validated['remarks'] ?? '',
        ]);

        // Recompute payment totals
        $totalPaid = $booking->payments()->sum('amount');
        $requiredDownpayment = $booking->total_amount * 0.50;

        if ($totalPaid >= $requiredDownpayment) {
            $booking->status = 'confirmed';
        } else {
            $booking->status = 'pencil';
        }

        if ($totalPaid >= $booking->total_amount) {
            $booking->payment_status = 'paid';
        } elseif ($totalPaid > 0) {
            $booking->payment_status = 'partial';
        } else {
            $booking->payment_status = 'unpaid'; 
        }

        $booking->save();

        $this->syncRoomStatus($booking);

        return redirect()->route('bookings.index')
            ->with('success', 'Booking updated successfully.');
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $request->validate([
            'status' => 'required|in:pencil,confirmed,reserved,checked_in,checked_out,cancelled,no_show',
        ]);

        $booking->status = $request->status;
        $booking->save();

        $this->syncRoomStatus($booking);

        $booking->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Booking status updated.');
    }

    public function printSOA(Booking $booking)
    {
        $booking->load([
            'client',
            'room',
            'payments',
            'bookingType',
            'rate',
            'bookingCharges',
        ]);

        $pdf = \PDF::loadView('pdfs.booking_soa', compact('booking'))
            ->setPaper('a4', 'portrait');

        return $pdf->stream('booking_soa.pdf');
    }
}