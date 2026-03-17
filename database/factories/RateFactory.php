<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RateFactory extends Factory
{
    public function definition(): array
    {
        $rates = [
            ['name' => 'Regular', 'value' => 0, 'type' => 'percentage'],
            ['name' => 'Complementary', 'value' => 100, 'type' => 'percentage'],
            ['name' => 'Supplier Discount', 'value' => 10, 'type' => 'percentage'],
            ['name' => 'Referral', 'value' => 5, 'type' => 'percentage'],
            ['name' => 'Special Owners Discount', 'value' => 15, 'type' => 'percentage'],
            ['name' => 'Owners Discount', 'value' => 10, 'type' => 'percentage'],
            ['name' => 'Corporate and Government', 'value' => 12, 'type' => 'percentage'],
            ['name' => 'Employee', 'value' => 10, 'type' => 'percentage'],
        ];

        return $this->faker->unique()->randomElement($rates);
    }
}