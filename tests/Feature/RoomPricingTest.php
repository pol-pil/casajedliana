<?php

use App\Models\Booking;
use App\Models\BookingType;
use App\Models\Rate;
use App\Models\Room;
use App\Models\User;
use App\Support\RoomPricing;
use Carbon\Carbon;

test('it calculates mixed weekday and weekend room pricing', function () {
    $room = Room::factory()->create([
        'weekday_rate' => 2950,
        'weekend_rate' => 3250,
        'price' => 2950,
    ]);

    $rate = Rate::factory()->create([
        'name' => 'Regular',
        'value' => 0,
        'type' => 'percentage',
    ]);

    $pricing = app(RoomPricing::class)->quote(
        $room,
        $rate,
        Carbon::parse('2026-04-23 14:00:00', 'Asia/Manila'),
        Carbon::parse('2026-04-27 11:00:00', 'Asia/Manila'),
    );

    expect($pricing['base_amount'])->toBe(12400.0)
        ->and($pricing['total_amount'])->toBe(12400.0)
        ->and($pricing['weekday_nights'])->toBe(2)
        ->and($pricing['weekend_nights'])->toBe(2);
});

test('it stores booking pricing from the selected dates instead of trusting the submitted total', function () {
    $user = User::factory()->create([
        'role' => 'frontdesk',
    ]);

    $room = Room::factory()->create([
        'weekday_rate' => 3985,
        'weekend_rate' => 4450,
        'price' => 3985,
        'capacity' => 2,
        'status' => 'Available',
    ]);

    $rate = Rate::factory()->create([
        'name' => 'Regular',
        'value' => 0,
        'type' => 'percentage',
    ]);

    $bookingType = BookingType::factory()->create();

    $this->actingAs($user)->post(route('bookings.store'), [
        'client' => [
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria@example.com',
            'contact_number' => '09171234567',
            'address' => 'Cabanatuan City',
            'company' => '',
        ],
        'room_id' => $room->id,
        'rate_id' => $rate->id,
        'check_in' => '2026-04-24 14:00:00',
        'check_out' => '2026-04-27 11:00:00',
        'guest_count' => 2,
        'purpose' => 'Leisure',
        'booking_type_id' => $bookingType->id,
        'total_amount' => 1,
        'remarks' => 'Late arrival',
    ])->assertRedirect(route('bookings.index'));

    $booking = Booking::query()->latest('id')->first();

    expect((float) $booking->base_amount)->toBe(12885.0)
        ->and((float) $booking->discount_amount)->toBe(0.0)
        ->and((float) $booking->total_amount)->toBe(12885.0)
        ->and($booking->pricing_breakdown)->toHaveCount(3);
});

test('it updates room weekday and weekend rates separately', function () {
    $user = User::factory()->create([
        'role' => 'frontdesk',
    ]);

    $room = Room::factory()->create([
        'weekday_rate' => 2950,
        'weekend_rate' => 3250,
        'price' => 2950,
    ]);

    $this->actingAs($user)->patch(route('rooms.update', $room), [
        'room_number' => $room->room_number,
        'room_type' => $room->room_type,
        'capacity' => $room->capacity,
        'weekday_rate' => 5550,
        'weekend_rate' => 6200,
        'description' => $room->description,
    ])->assertSessionHasNoErrors();

    $room->refresh();

    expect((float) $room->weekday_rate)->toBe(5550.0)
        ->and((float) $room->weekend_rate)->toBe(6200.0)
        ->and((float) $room->price)->toBe(5550.0);
});
