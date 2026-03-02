<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        $bookings = [

            [
                'client_id' => 1,
                'room_id' => 1,
                'receptionist_id' => 1,
                'rate_id' => null,
                'booking_type_id' => 1, // Walk-in
                'guest_count' => 2,
                'check_in' => $today,
                'check_out' => $today->copy()->addDays(2),
                'total_amount' => 7000.00,
                'status' => 'checked_in',
            ],

            [
                'client_id' => 2,
                'room_id' => 2,
                'receptionist_id' => 1,
                'rate_id' => null,
                'booking_type_id' => 2, // Online
                'guest_count' => 2,
                'check_in' => $today->copy()->addDay(),
                'check_out' => $today->copy()->addDays(3),
                'total_amount' => 8000.00,
                'status' => 'reserved',
            ],

            [
                'client_id' => 3,
                'room_id' => 3,
                'receptionist_id' => 1,
                'rate_id' => null,
                'booking_type_id' => 1, // Walk-in
                'guest_count' => 2,
                'check_in' => $today,
                'check_out' => $today->copy()->addDay(),
                'total_amount' => 3500.00,
                'status' => 'pencil',
            ],

            [
                'client_id' => 4,
                'room_id' => 4,
                'receptionist_id' => 1,
                'rate_id' => null,
                'booking_type_id' => 3, // Corporate
                'guest_count' => 2,
                'check_in' => $today->copy()->subDays(3),
                'check_out' => $today->copy()->subDay(),
                'total_amount' => 9000.00,
                'status' => 'checked_out',
            ],

            [
                'client_id' => 5,
                'room_id' => 11,
                'receptionist_id' => 1,
                'rate_id' => null,
                'booking_type_id' => 2, // Online
                'guest_count' => 2,
                'check_in' => $today->copy()->addDays(2),
                'check_out' => $today->copy()->addDays(5),
                'total_amount' => 10000.00,
                'status' => 'reserved',
            ],
        ];

        foreach ($bookings as &$booking) {
            $booking['created_at'] = now();
            $booking['updated_at'] = now();
        }

        DB::table('bookings')->insert($bookings);
    }
}