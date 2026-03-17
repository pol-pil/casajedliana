<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ClientFactory extends Factory
{
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'contact_number' => $this->faker->numerify('09#########'),
            'email' => $this->faker->optional(0.7)->safeEmail(),
            'address' => $this->faker->optional(0.6)->address(),
            'company' => $this->faker->optional(0.3)->company(),
        ];
    }
}