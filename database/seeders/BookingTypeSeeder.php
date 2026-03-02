<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookingTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('booking_types')->insert([
            [
                'name' => 'Walk-in',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Online',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Corporate',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}