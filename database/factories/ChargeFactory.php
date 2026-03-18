<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ChargeFactory extends Factory
{
    public function definition(): array
    {
        $amenities = [
            ['name' => 'Extra Pax', 'value' => 850.00, 'type' => 'amenity'],
            ['name' => 'Laundry Bag', 'value' => 30.00, 'type' => 'amenity'],
            ['name' => 'Towel', 'value' => 150.00, 'type' => 'amenity'],
            ['name' => 'Pool Towel', 'value' => 80.00, 'type' => 'amenity'],
            ['name' => 'Bathrobe', 'value' => 150.00, 'type' => 'amenity'],
            ['name' => 'Slippers', 'value' => 30.00, 'type' => 'amenity'],
            ['name' => 'Shampoo', 'value' => 10.00, 'type' => 'amenity'],
            ['name' => 'Dental Kit', 'value' => 25.00, 'type' => 'amenity'],
            ['name' => 'Soap', 'value' => 10.00, 'type' => 'amenity'],
        ];

        $damages = [
            ['name' => 'Canister', 'value' => 300.00, 'type' => 'damage'],
            ['name' => 'Pool Towel Damage', 'value' => 250.00, 'type' => 'damage'],
            ['name' => 'Towel Damage', 'value' => 500.00, 'type' => 'damage'],
            ['name' => 'Key Chain', 'value' => 750.00, 'type' => 'damage'],
            ['name' => 'Key', 'value' => 500.00, 'type' => 'damage'],
            ['name' => 'Keycard Loss', 'value' => 1500.00, 'type' => 'damage'],
            ['name' => 'Blanket/Stain', 'value' => 1500.00, 'type' => 'damage'],
            ['name' => 'Pillow Case', 'value' => 300.00, 'type' => 'damage'],
            ['name' => 'Linen/Stain', 'value' => 1500.00, 'type' => 'damage'],
            ['name' => 'Plates', 'value' => 120.00, 'type' => 'damage'],
            ['name' => 'Glass', 'value' => 150.00, 'type' => 'damage'],
            ['name' => 'Mug', 'value' => 100.00, 'type' => 'damage'],
        ];

        $allCharges = array_merge($amenities, $damages);
        $charge = $this->faker->randomElement($allCharges);

        return [
            'name' => $charge['name'],
            'value' => $charge['value'],
            'type' => $charge['type'],
            'is_active' => true,
        ];
    }
}
