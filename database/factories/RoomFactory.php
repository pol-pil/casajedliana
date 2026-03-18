<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RoomFactory extends Factory
{
    public function definition(): array
    {
        $roomTypes = [
            'Standard' => ['price' => 2950, 'capacity' => 2, 'numbers' => ['203', '204', '205', '206']],
            'Suite' => ['price' => 3985, 'capacity' => 2, 'numbers' => ['201', '202']],
            'Quadro' => ['price' => 5450, 'capacity' => 4, 'numbers' => ['207', '208']],
            'Penthouse' => ['price' => 6550, 'capacity' => 2, 'numbers' => ['300']],
            'Family' => ['price' => 5550, 'capacity' => 5, 'numbers' => ['101-102', '103-104']],
            'Resthouse' => ['price' => 12500, 'capacity' => 8, 'numbers' => ['105']],
        ];

        $roomType = $this->faker->randomElement(array_keys($roomTypes));
        $roomData = $roomTypes[$roomType];
        $roomNumber = $this->faker->unique()->randomElement($roomData['numbers']);

        return [
            'room_number' => $roomNumber,
            'room_type' => $roomType,
            'capacity' => $roomData['capacity'],
            'description' => $this->faker->optional(0.8)->sentence(),
            'price' => $roomData['price'],
            'status' => $this->faker->randomElement(['Available', 'Occupied', 'Reserved']),
            'is_active' => true,
        ];
    }
}
