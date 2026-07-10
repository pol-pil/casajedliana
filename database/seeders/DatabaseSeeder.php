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
use App\Support\RoomPricing;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(InitialSetupSeeder::class);

        $receptionist = User::query()->where('email', 'admin@gmail.com')->firstOrFail();

        $clients = Client::factory(20)->create();

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
            $pricing = app(RoomPricing::class)->quote($room, $rate, $checkIn, $checkOut);

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
                'total_amount' => $pricing['total_amount'],
                'base_amount' => $pricing['base_amount'],
                'discount_amount' => $pricing['discount_amount'],
                'pricing_breakdown' => $pricing['pricing_breakdown'],
                'payment_status' => fake()->randomElement(['unpaid', 'partial', 'paid']),
                'status' => fake()->randomElement(['pencil', 'confirmed', 'checked_in', 'checked_out', 'no_show', 'cancelled']),
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now(),
            ]);

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

            $paymentStatus = $booking->payment_status;
            $totalWithCharges = $booking->total_amount + $totalCharges;

            if ($paymentStatus === 'paid') {
                Payment::create([
                    'booking_id' => $booking->id,
                    'amount' => $totalWithCharges,
                    'payment_method' => fake()->randomElement(['Cash', 'GCash', 'Credit Card', 'Bank Transfer']),
                    'payment_type' => 'Full Payment',
                    'created_at' => Carbon::parse($booking->created_at)->addDays(rand(1, 5)),
                ]);
            } elseif ($paymentStatus === 'partial') {
                $partialAmount = $totalWithCharges * (rand(50, 70) / 100);

                Payment::create([
                    'booking_id' => $booking->id,
                    'amount' => round($partialAmount, 2),
                    'payment_method' => fake()->randomElement(['Cash', 'GCash', 'Credit Card', 'Bank Transfer']),
                    'payment_type' => 'Downpayment',
                    'created_at' => Carbon::parse($booking->created_at)->addDays(1),
                ]);
            }

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

        $this->updateRoomStatuses();
    }

    private function updateRoomStatuses(): void
    {
        $now = Carbon::now();

        $rooms = Room::all();

        foreach ($rooms as $room) {
            $activeBooking = Booking::where('room_id', $room->id)
                ->where('status', '!=', 'cancelled')
                ->where('status', '!=', 'checked_out')
                ->where('check_in', '<=', $now)
                ->where('check_out', '>=', $now)
                ->first();

            if ($activeBooking) {
                $room->status = 'Occupied';
            } else {
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
