<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingCharge;
use App\Models\BookingType;
use App\Models\Charge;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Rate;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $bookingTypes = [
            'Agoda',
            'Airbnb',
            'Booking.com',
            'Complementary (Event Package)',
            'Facebook',
            'Instagram',
            'Phone Call',
            'Walk-In',
        ];

        foreach ($bookingTypes as $type) {
            BookingType::create([
                'name' => $type,
                'is_active' => true,
            ]);
        }

        // Create rates
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

        foreach ($rates as $rate) {
            Rate::create($rate);
        }

        // Create charges
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

        foreach (array_merge($amenities, $damages) as $charge) {
            Charge::create([
                'name' => $charge['name'],
                'value' => $charge['value'],
                'type' => $charge['type'],
                'is_active' => true,
            ]);
        }

        // Create rooms
        $rooms = [
            // Standard rooms
            ['room_number' => '203', 'room_type' => 'Standard', 'capacity' => 2, 'price' => 2950.00],
            ['room_number' => '204', 'room_type' => 'Standard', 'capacity' => 2, 'price' => 2950.00],
            ['room_number' => '205', 'room_type' => 'Standard', 'capacity' => 2, 'price' => 2950.00],
            ['room_number' => '206', 'room_type' => 'Standard', 'capacity' => 2, 'price' => 2950.00],

            // Suite rooms
            ['room_number' => '201', 'room_type' => 'Suite', 'capacity' => 2, 'price' => 3985.00],
            ['room_number' => '202', 'room_type' => 'Suite', 'capacity' => 2, 'price' => 3985.00],

            // Quadro rooms
            ['room_number' => '207', 'room_type' => 'Quadro', 'capacity' => 4, 'price' => 5450.00],
            ['room_number' => '208', 'room_type' => 'Quadro', 'capacity' => 4, 'price' => 5450.00],

            // Penthouse
            ['room_number' => '300', 'room_type' => 'Penthouse', 'capacity' => 2, 'price' => 6550.00],

            // Family rooms
            ['room_number' => '101-102', 'room_type' => 'Family', 'capacity' => 5, 'price' => 5550.00],
            ['room_number' => '103-104', 'room_type' => 'Family', 'capacity' => 5, 'price' => 5550.00],

            // Resthouse
            ['room_number' => '105', 'room_type' => 'Resthouse', 'capacity' => 8, 'price' => 12500.00],
        ];

        foreach ($rooms as $room) {
            Room::create([
                'room_number' => $room['room_number'],
                'room_type' => $room['room_type'],
                'capacity' => $room['capacity'],
                'description' => "Beautiful {$room['room_type']} room with amazing views",
                'price' => $room['price'],
                'status' => 'Available',
                'is_active' => true,
            ]);
        }

        // Create a receptionist user
        $receptionist = User::create([
            'name' => 'John Receptionist',
            'email' => 'receptionist@hotel.com',
            'password' => bcrypt('password'),
        ]);

        // Create clients
        $clients = Client::factory(20)->create();

        // Create bookings with proper calculations
        $bookings = [];
        $charges = Charge::all();
        $rates = Rate::all();
        $rooms = Room::all();
        $bookingTypes = BookingType::all();

        for ($i = 0; $i < 30; $i++) {
            $room = $rooms->random();
            $client = $clients->random();
            $rate = $rates->random();
            $bookingType = $bookingTypes->random();

            $checkIn = Carbon::now()->subDays(rand(1, 5))->addHours(rand(0, 23));
            $checkOut = (clone $checkIn)->addDays(rand(1, 10))->addHours(rand(0, 23));
            $nights = $checkIn->diffInDays($checkOut);

            // Calculate total amount: room price * nights * (100 - rate%) / 100
            $baseAmount = $room->price * $nights;
            $discountMultiplier = (100 - $rate->value) / 100;
            $totalAmount = $baseAmount * $discountMultiplier;

            $booking = Booking::create([
                'client_id' => $client->id,
                'room_id' => $room->id,
                'receptionist_id' => $receptionist->id,
                'rate_id' => $rate->id,
                'booking_type_id' => $bookingType->id,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'remarks' => fake()->optional(0.7)->sentence(),
                'purpose' => fake()->randomElement(['Leisure', 'Business/Corporate', 'Events/Social', 'Government Event']),
                'guest_count' => rand(1, $room->capacity),
                'total_amount' => round($totalAmount, 2),
                'payment_status' => fake()->randomElement(['unpaid', 'partial', 'paid']),
                'status' => fake()->randomElement(['pencil', 'confirmed', 'checked_in', 'checked_out', 'no_show', 'cancelled']),
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now(),
            ]);

            // Add random charges to booking
            $numberOfCharges = rand(0, 3);
            $totalCharges = 0;

            for ($j = 0; $j < $numberOfCharges; $j++) {
                $charge = $charges->random();
                $quantity = rand(1, 3);
                $chargeTotal = $charge->value * $quantity;

                BookingCharge::create([
                    'booking_id' => $booking->id,
                    'charge_id' => $charge->id,
                    'quantity' => $quantity,
                    'value' => $charge->value,
                    'total' => $chargeTotal,
                    'created_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);

                $totalCharges += $chargeTotal;
            }

            // Create payments
            $paymentStatus = $booking->payment_status;
            $totalWithCharges = $booking->total_amount + $totalCharges;

            if ($paymentStatus === 'paid') {
                // Full payment
                Payment::create([
                    'booking_id' => $booking->id,
                    'amount' => $totalWithCharges,
                    'payment_method' => fake()->randomElement(['Cash', 'GCash', 'Credit Card', 'Bank Transfer']),
                    'payment_type' => 'Full Payment',
                    'created_at' => Carbon::parse($booking->created_at)->addDays(rand(1, 5)),
                ]);
            } elseif ($paymentStatus === 'partial') {
                // Partial payment (50-70% of total)
                $partialAmount = $totalWithCharges * (rand(50, 70) / 100);

                // Downpayment
                Payment::create([
                    'booking_id' => $booking->id,
                    'amount' => round($partialAmount, 2),
                    'payment_method' => fake()->randomElement(['Cash', 'GCash', 'Credit Card', 'Bank Transfer']),
                    'payment_type' => 'Downpayment',
                    'created_at' => Carbon::parse($booking->created_at)->addDays(1),
                ]);
            }

            // For checked_out bookings, add final payment
            if ($booking->status === 'checked_out' && $paymentStatus === 'partial') {
                $totalPaid = Payment::where('booking_id', $booking->id)->sum('amount');
                $remainingBalance = $totalWithCharges - $totalPaid;

                if ($remainingBalance > 0) {
                    Payment::create([
                        'booking_id' => $booking->id,
                        'amount' => $remainingBalance,
                        'payment_method' => fake()->randomElement(['Cash', 'GCash', 'Credit Card', 'Bank Transfer']),
                        'payment_type' => 'Partial Payment',
                        'created_at' => Carbon::parse($booking->check_out)->addHours(rand(1, 12)),
                    ]);
                }
            }
        }

        // Update room statuses based on current bookings
        $this->updateRoomStatuses();
    }

    private function updateRoomStatuses()
    {
        $now = Carbon::now();

        // Get all rooms
        $rooms = Room::all();

        foreach ($rooms as $room) {
            // Check if room has active booking
            $activeBooking = Booking::where('room_id', $room->id)
                ->where('status', '!=', 'cancelled')
                ->where('status', '!=', 'checked_out')
                ->where('check_in', '<=', $now)
                ->where('check_out', '>=', $now)
                ->first();

            if ($activeBooking) {
                $room->status = 'Occupied';
            } else {
                // Check for future bookings
                $futureBooking = Booking::where('room_id', $room->id)
                    ->where('status', 'confirmed')
                    ->where('check_in', '>', $now)
                    ->exists();

                $room->status = $futureBooking ? 'Reserved' : 'Available';
            }

            $room->save();
        }
    }
}
