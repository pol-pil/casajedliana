<?php

namespace Database\Seeders;

use App\Models\BookingType;
use App\Models\Charge;
use App\Models\Rate;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class InitialSetupSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->bookingTypes() as $type) {
            BookingType::query()->updateOrCreate(
                ['name' => $type],
                ['is_active' => true],
            );
        }

        foreach ($this->rates() as $rate) {
            Rate::query()->updateOrCreate(
                ['name' => $rate['name']],
                [
                    'value' => $rate['value'],
                    'type' => $rate['type'],
                    'is_active' => true,
                ],
            );
        }

        foreach ($this->charges() as $charge) {
            Charge::query()->updateOrCreate(
                [
                    'name' => $charge['name'],
                    'type' => $charge['type'],
                ],
                [
                    'value' => $charge['value'],
                    'is_active' => true,
                ],
            );
        }

        foreach ($this->rooms() as $room) {
            Room::query()->updateOrCreate(
                ['room_number' => $room['room_number']],
                [
                    'room_type' => $room['room_type'],
                    'capacity' => $room['capacity'],
                    'description' => "Beautiful {$room['room_type']} room with amazing views",
                    'price' => $room['weekday_rate'],
                    'weekday_rate' => $room['weekday_rate'],
                    'weekend_rate' => $room['weekend_rate'],
                    'status' => 'Available',
                    'is_active' => true,
                ],
            );
        }

        User::query()->updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin Frontdesk',
                'password' => bcrypt('admin'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ],
        );
    }

    /**
     * @return list<string>
     */
    private function bookingTypes(): array
    {
        return [
            'Agoda',
            'Airbnb',
            'Booking.com',
            'Complimentary (Event Package)',
            'Facebook',
            'Instagram',
            'Phone Call',
            'Walk-In',
        ];
    }

    /**
     * @return list<array{name: string, value: int, type: string}>
     */
    private function rates(): array
    {
        return [
            ['name' => 'Regular', 'value' => 0, 'type' => 'percentage'],
            ['name' => 'Complimentary', 'value' => 100, 'type' => 'percentage'],
            ['name' => 'Supplier Discount', 'value' => 10, 'type' => 'percentage'],
            ['name' => 'Referral', 'value' => 5, 'type' => 'percentage'],
            ['name' => 'Special Owners Discount', 'value' => 15, 'type' => 'percentage'],
            ['name' => 'Owners Discount', 'value' => 10, 'type' => 'percentage'],
            ['name' => 'Corporate and Government', 'value' => 12, 'type' => 'percentage'],
            ['name' => 'Employee', 'value' => 10, 'type' => 'percentage'],
        ];
    }

    /**
     * @return list<array{name: string, value: float, type: string}>
     */
    private function charges(): array
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
            ['name' => 'Late Checkout', 'value' => 0.00, 'type' => 'amenity'],
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

        return [...$amenities, ...$damages];
    }

    /**
     * @return list<array{room_number: string, room_type: string, capacity: int, weekday_rate: float, weekend_rate: float}>
     */
    private function rooms(): array
    {
        return [
            ['room_number' => '203', 'room_type' => 'Standard', 'capacity' => 2, 'weekday_rate' => 2950.00, 'weekend_rate' => 3250.00],
            ['room_number' => '204', 'room_type' => 'Standard', 'capacity' => 2, 'weekday_rate' => 2950.00, 'weekend_rate' => 3250.00],
            ['room_number' => '205', 'room_type' => 'Standard', 'capacity' => 2, 'weekday_rate' => 2950.00, 'weekend_rate' => 3250.00],
            ['room_number' => '206', 'room_type' => 'Standard', 'capacity' => 2, 'weekday_rate' => 2950.00, 'weekend_rate' => 3250.00],
            ['room_number' => '201', 'room_type' => 'Suite', 'capacity' => 2, 'weekday_rate' => 3985.00, 'weekend_rate' => 4450.00],
            ['room_number' => '202', 'room_type' => 'Suite', 'capacity' => 2, 'weekday_rate' => 3985.00, 'weekend_rate' => 4450.00],
            ['room_number' => '207', 'room_type' => 'Quadro', 'capacity' => 4, 'weekday_rate' => 5450.00, 'weekend_rate' => 6050.00],
            ['room_number' => '208', 'room_type' => 'Quadro', 'capacity' => 4, 'weekday_rate' => 5450.00, 'weekend_rate' => 6050.00],
            ['room_number' => '300', 'room_type' => 'Penthouse', 'capacity' => 2, 'weekday_rate' => 6650.00, 'weekend_rate' => 7300.00],
            ['room_number' => '101-102', 'room_type' => 'Family', 'capacity' => 5, 'weekday_rate' => 5550.00, 'weekend_rate' => 6200.00],
            ['room_number' => '103-104', 'room_type' => 'Family', 'capacity' => 5, 'weekday_rate' => 5550.00, 'weekend_rate' => 6200.00],
            ['room_number' => '105', 'room_type' => 'Resthouse', 'capacity' => 8, 'weekday_rate' => 12500.00, 'weekend_rate' => 13450.00],
        ];
    }
}
