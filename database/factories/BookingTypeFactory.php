<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BookingTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->randomElement([
                'Agoda',
                'Airbnb',
                'Booking.com',
                'Complementary (Event Package)',
                'Facebook',
                'Instagram',
                'Phone Call',
                'Walk-In',
            ]),
            'is_active' => true,
        ];
    }
}
