<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\BookingType;
use App\Models\Charge;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\Room;
use App\Support\RoomPricing;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingsController extends Controller
{
    public function __construct(private RoomPricing $roomPricing) {}

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

        $calendarBookings = Booking::with([
            'client',
            'room',
            'payments',
            'bookingType',
            'bookingCharges.charge',
            'rate',
        ])
            ->whereNotIn('status', ['cancelled', 'checked_out', 'no_show'])
            ->get()
            ->map(function (Booking $booking) {
                $booking->refreshPaymentStatus();

                return $booking;
            });

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
        $charges = Charge::query()
            ->where('is_active', true)
            ->where('is_custom', false)
            ->get();
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
            'calendarBookings' => $calendarBookings,
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

    public function store(StoreBookingRequest $request)
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

        $validated = $request->validated();
        $room = Room::query()->findOrFail($validated['room_id']);
        $rate = Rate::query()->findOrFail($request->input('rate_id'));
        $pricing = $this->roomPricing->quote($room, $rate, $validated['check_in'], $validated['check_out']);

        $client = Client::firstOrCreate(
            ['contact_number' => $validated['client']['contact_number']],
            $validated['client']
        );

        $booking = Booking::create([
            'client_id' => $client->id,
            'room_id' => $validated['room_id'],
            'receptionist_id' => auth()->id(),
            'rate_id' => $request->input('rate_id'),
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'guest_count' => $validated['guest_count'],
            'purpose' => $validated['purpose'],
            'booking_type_id' => $validated['booking_type_id'],
            'total_amount' => $pricing['total_amount'],
            'base_amount' => $pricing['base_amount'],
            'discount_amount' => $pricing['discount_amount'],
            'pricing_breakdown' => $pricing['pricing_breakdown'],
            'remarks' => $validated['remarks'] ?? '',
            'payment_status' => ! empty($validated['downpayment']) ? 'partial' : 'unpaid',
            'status' => 'pencil',
        ]);

        $this->syncRoomStatus($booking);

        ActivityLog::create([
            'user_id' => Auth::id(),
            'staff_name' => Auth::user()->name,
            'action' => 'CREATE_BOOKING',
            'guest_name' => $client->first_name . ' ' . $client->last_name,
            'room_number' => $booking->room->room_number,
            'status' => $booking->status, // pencil or confirmed
        ]);

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
            
            $booking->refreshPaymentStatus();

            $booking->save();
        }

        return redirect()->route('bookings.index')
            ->with('success', 'Booking created successfully.');
    }

    public function update(UpdateBookingRequest $request, Booking $booking)
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

        $validated = $request->validated();
        $room = Room::query()->findOrFail($validated['room_id']);
        $rate = Rate::query()->findOrFail($request->input('rate_id'));
        $pricing = $this->roomPricing->quote($room, $rate, $validated['check_in'], $validated['check_out']);

        $booking->client->update($validated['client']);

        $booking->update([
            'room_id' => $validated['room_id'],
            'rate_id' => $rate->id,
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'guest_count' => $validated['guest_count'],
            'purpose' => $validated['purpose'],
            'booking_type_id' => $validated['booking_type_id'],
            'total_amount' => $pricing['total_amount'],
            'base_amount' => $pricing['base_amount'],
            'discount_amount' => $pricing['discount_amount'],
            'pricing_breakdown' => $pricing['pricing_breakdown'],
            'remarks' => $validated['remarks'] ?? '',
        ]);

        $totalPaid = $booking->payments()->sum('amount');
        $requiredDownpayment = $booking->total_amount * 0.50;

        if (in_array($booking->status, ['pencil', 'confirmed'])) {
            if ($totalPaid >= $requiredDownpayment) {
                $booking->status = 'confirmed';
            } else {
                $booking->status = 'pencil';
            }
        }

        if ($totalPaid >= $booking->total_amount) {
            $booking->payment_status = 'paid';
        } elseif ($totalPaid > 0) {
            $booking->payment_status = 'partial';
        } else {
            $booking->payment_status = 'unpaid';
        }
        $booking->refreshPaymentStatus();

        $booking->save();

        ActivityLog::create([
            'user_id' => Auth::id(),
            'staff_name' => Auth::user()->name,
            'action' => 'UPDATE_BOOKING',
            'guest_name' => $booking->client->first_name . ' ' . $booking->client->last_name,
            'room_number' => $booking->room->room_number,
            'status' => $booking->status,
        ]);

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

        $actionMap = [
            'checked_in' => 'CHECK_IN',
            'checked_out' => 'CHECK_OUT',
            'cancelled' => 'CANCEL_BOOKING',
            'no_show' => 'CANCEL_BOOKING',
            'confirmed' => 'CREATE_BOOKING',
            'pencil' => 'CREATE_BOOKING',
            'reserved' => 'CREATE_BOOKING',
        ];

        ActivityLog::create([
            'user_id' => Auth::id(),
            'staff_name' => Auth::user()->name,
            'action' => $actionMap[$request->status] ?? 'CREATE_BOOKING',
            'guest_name' => $booking->client->first_name . ' ' . $booking->client->last_name,
            'room_number' => $booking->room->room_number,
            'status' => $request->status,
        ]);

        $this->syncRoomStatus($booking);

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
