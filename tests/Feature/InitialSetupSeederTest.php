<?php

use App\Models\Booking;
use App\Models\BookingType;
use App\Models\Charge;
use App\Models\Rate;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\InitialSetupSeeder;

test('initial setup seeder creates setup data without bookings', function () {
    $this->seed(InitialSetupSeeder::class);

    expect(Booking::query()->count())->toBe(0);

    expect(BookingType::query()->count())->toBe(8);
    expect(Rate::query()->count())->toBe(8);
    expect(Charge::query()->count())->toBe(22);
    expect(Room::query()->count())->toBe(12);

    $receptionist = User::query()->where('email', 'admin@gmail.com')->first();

    expect($receptionist)->not->toBeNull();
    expect($receptionist->name)->toBe('Admin Frontdesk');
    expect($receptionist->role)->toBe('admin');
    expect($receptionist->email_verified_at)->not->toBeNull();
});
