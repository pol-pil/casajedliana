<?php

use App\Models\Booking;
use App\Models\Rate;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page for the rates page', function () {
    $response = $this->get(route('rates.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the rates page', function () {
    $user = User::factory()->create([
        'role' => 'frontdesk',
    ]);

    $this->actingAs($user);

    $response = $this->get(route('rates.index'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Rates/Index')
            ->has('rates')
            ->has('charges')
            ->has('bookingTypes')
            ->has('chartRates')
            ->has('chartStats')
            ->has('chartDiscounts'));
});

test('rates charts props are filtered by the selected date range', function () {
    Carbon::setTestNow('2026-04-22 10:00:00');

    $user = User::factory()->create([
        'role' => 'frontdesk',
    ]);

    $rateInRange = Rate::factory()->create([
        'name' => 'In Range Discount',
        'value' => 10,
        'type' => 'percentage',
        'is_custom' => false,
    ]);

    $rateOutOfRange = Rate::factory()->create([
        'name' => 'Out of Range Discount',
        'value' => 15,
        'type' => 'percentage',
        'is_custom' => false,
    ]);

    $room = Room::factory()->create([
        'price' => 2000,
    ]);

    Booking::factory()->create([
        'rate_id' => $rateInRange->id,
        'room_id' => $room->id,
        'check_in' => '2026-04-10 14:00:00',
        'check_out' => '2026-04-12 12:00:00',
        'status' => 'confirmed',
        'base_amount' => 4000,
        'discount_amount' => 400,
        'total_amount' => 3600,
        'pricing_breakdown' => [
            [
                'date' => '2026-04-10',
                'day_name' => 'Friday',
                'day_type' => 'weekend',
                'amount' => 2000,
            ],
            [
                'date' => '2026-04-11',
                'day_name' => 'Saturday',
                'day_type' => 'weekend',
                'amount' => 2000,
            ],
        ],
    ]);

    Booking::factory()->create([
        'rate_id' => $rateOutOfRange->id,
        'room_id' => $room->id,
        'check_in' => '2026-04-18 14:00:00',
        'check_out' => '2026-04-20 12:00:00',
        'status' => 'confirmed',
        'base_amount' => 4000,
        'discount_amount' => 600,
        'total_amount' => 3400,
        'pricing_breakdown' => [
            [
                'date' => '2026-04-18',
                'day_name' => 'Saturday',
                'day_type' => 'weekend',
                'amount' => 2000,
            ],
            [
                'date' => '2026-04-19',
                'day_name' => 'Sunday',
                'day_type' => 'weekday',
                'amount' => 2000,
            ],
        ],
    ]);

    $this->actingAs($user);

    $response = $this->get(route('rates.index', [
        'start' => '2026-04-10',
        'end' => '2026-04-12',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Rates/Index')
            ->where('chartStats.totalBookings', 1)
            ->where('rates.0.name', 'In Range Discount')
            ->missing('rates.0.bookings_count')
            ->where('chartRates.0.name', 'In Range Discount')
            ->where('chartRates.0.bookings_count', 1)
            ->where('chartDiscounts.0.name', 'In Range Discount')
            ->where('chartDiscounts.0.totalDiscount', 400)
            ->where('chartDiscounts.1.name', 'Out of Range Discount')
            ->where('chartDiscounts.1.totalDiscount', 0));
});
