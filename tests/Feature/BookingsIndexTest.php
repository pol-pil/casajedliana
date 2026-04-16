<?php

use App\Models\Booking;
use App\Models\BookingCharge;
use App\Models\Charge;
use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('authenticated users can visit bookings with calendar data', function () {
    $user = User::factory()->create([
        'role' => 'frontdesk',
    ]);

    $room = Room::factory()->create([
        'room_number' => '201',
        'room_type' => 'Suite',
        'status' => 'Reserved',
    ]);

    Booking::factory()->create([
        'room_id' => $room->id,
        'status' => 'confirmed',
    ]);

    $this->actingAs($user);

    $response = $this->get(route('bookings.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Bookings/Index')
            ->has('bookings')
            ->has('calendarBookings', 1)
            ->has('calendarBookings.0.client')
            ->has('calendarBookings.0.room')
            ->has('rooms', 1)
            ->has('stats')
            ->has('filters'));
});

test('booking payment status is partial when payments only cover room total without charges', function () {
    $booking = Booking::factory()->create([
        'total_amount' => 1000,
        'payment_status' => 'paid',
    ]);

    $charge = Charge::factory()->create();

    BookingCharge::create([
        'booking_id' => $booking->id,
        'charge_id' => $charge->id,
        'quantity' => 1,
        'value' => 200,
        'total' => 200,
    ]);

    Payment::create([
        'booking_id' => $booking->id,
        'amount' => 1000,
        'payment_method' => 'Cash',
        'payment_type' => 'full',
    ]);

    $booking->refreshPaymentStatus();

    expect($booking->payment_status)->toBe('partial');
});

test('booking payment status is paid when payments cover room total and charges', function () {
    $booking = Booking::factory()->create([
        'total_amount' => 1000,
    ]);

    $charge = Charge::factory()->create();

    BookingCharge::create([
        'booking_id' => $booking->id,
        'charge_id' => $charge->id,
        'quantity' => 1,
        'value' => 200,
        'total' => 200,
    ]);

    Payment::create([
        'booking_id' => $booking->id,
        'amount' => 1200,
        'payment_method' => 'Cash',
        'payment_type' => 'full',
    ]);

    $booking->refreshPaymentStatus();

    expect($booking->payment_status)->toBe('paid');
});

test('checked in booking dates can be updated before checkout', function () {
    Carbon::setTestNow('2026-04-16 12:00:00');

    $user = User::factory()->create([
        'role' => 'frontdesk',
    ]);

    $booking = Booking::factory()->create([
        'check_in' => now()->subDay()->setTime(8, 0),
        'check_out' => now()->addDay()->setTime(17, 0),
        'status' => 'checked_in',
        'total_amount' => 3000,
    ]);

    $newCheckIn = now()->subDays(2)->setTime(9, 30);
    $newCheckOut = now()->addDays(2)->setTime(18, 0);

    $this->actingAs($user);

    $this->put(route('bookings.update', $booking), [
        'client' => [
            'first_name' => $booking->client->first_name,
            'last_name' => $booking->client->last_name,
            'email' => $booking->client->email,
            'contact_number' => $booking->client->contact_number,
            'address' => $booking->client->address,
            'company' => $booking->client->company,
        ],
        'room_id' => $booking->room_id,
        'rate_id' => $booking->rate_id,
        'check_in' => $newCheckIn->toDateTimeString(),
        'check_out' => $newCheckOut->toDateTimeString(),
        'guest_count' => $booking->guest_count,
        'purpose' => $booking->purpose,
        'booking_type_id' => $booking->booking_type_id,
        'total_amount' => $booking->total_amount,
        'payment_method' => null,
        'remarks' => $booking->remarks,
    ])->assertRedirect(route('bookings.index'));

    $booking->refresh();

    expect($booking->check_in->toDateTimeString())->toBe($newCheckIn->toDateTimeString())
        ->and($booking->check_out->toDateTimeString())->toBe($newCheckOut->toDateTimeString())
        ->and($booking->status)->toBe('checked_in');
});
