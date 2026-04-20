<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RoomFactory extends Factory
{
    public function definition(): array
    {
        $roomTypes = [
            'Standard' => ['weekday_rate' => 2950, 'weekend_rate' => 3250, 'capacity' => 2, 'numbers' => ['203', '204', '205', '206']],
            'Suite' => ['weekday_rate' => 3985, 'weekend_rate' => 4450, 'capacity' => 2, 'numbers' => ['201', '202']],
            'Quadro' => ['weekday_rate' => 5450, 'weekend_rate' => 6050, 'capacity' => 4, 'numbers' => ['207', '208']],
            'Penthouse' => ['weekday_rate' => 6650, 'weekend_rate' => 7300, 'capacity' => 2, 'numbers' => ['300']],
            'Family' => ['weekday_rate' => 5550, 'weekend_rate' => 6200, 'capacity' => 5, 'numbers' => ['101-102', '103-104']],
            'Resthouse' => ['weekday_rate' => 12500, 'weekend_rate' => 13450, 'capacity' => 8, 'numbers' => ['105']],
        ];

        $roomType = $this->faker->randomElement(array_keys($roomTypes));
        $roomData = $roomTypes[$roomType];
        $roomNumber = $this->faker->unique()->randomElement($roomData['numbers']);

        return [
            'room_number' => $roomNumber,
            'room_type' => $roomType,
            'capacity' => $roomData['capacity'],
            'description' => $this->faker->optional(0.8)->sentence(),
            'price' => $roomData['weekday_rate'],
            'weekday_rate' => $roomData['weekday_rate'],
            'weekend_rate' => $roomData['weekend_rate'],
            'status' => $this->faker->randomElement(['Available', 'Occupied', 'Reserved']),
            'is_active' => true,
        ];
    }
}
