<?php

namespace Database\Factories;

use App\Models\BookingType;
use App\Models\Client;
use App\Models\Rate;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        $checkIn = Carbon::instance($this->faker->dateTimeBetween('-1 month', '+2 months'));
        $checkOut = (clone $checkIn)->addDays($this->faker->numberBetween(1, 7));

        return [
            'client_id' => Client::factory(),
            'room_id' => Room::factory(),
            'receptionist_id' => User::factory(),
            'rate_id' => Rate::factory(),
            'booking_type_id' => BookingType::factory(),
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'remarks' => $this->faker->optional(0.5)->sentence(),
            'purpose' => $this->faker->optional(0.7)->randomElement([
                'Leisure',
                'Business/Corporate',
                'Events/Social',
                'Government Event',
            ]),
            'guest_count' => $this->faker->numberBetween(1, 4),
            'total_amount' => 0, // Will be calculated in seeder
            'payment_status' => $this->faker->randomElement(['unpaid', 'partial', 'paid']),
            'status' => $this->faker->randomElement([
                'pencil',
                'confirmed',
                'checked_in',
                'checked_out',
                'no_show',
                'cancelled',
            ]),
        ];
    }
}
