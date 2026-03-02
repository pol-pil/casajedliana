<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $clients = [
            [
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'contact_number' => '09171234567',
                'email' => 'juan@example.com',
                'company' => 'ABC Corporation',
                'address' => 'Manila, Philippines',
            ],
            [
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'contact_number' => '09181234567',
                'email' => 'maria@example.com',
                'company' => null,
                'address' => 'Quezon City',
            ],
            [
                'first_name' => 'James',
                'last_name' => 'Reyes',
                'contact_number' => '09191234567',
                'email' => 'james@example.com',
                'company' => 'Reyes Holdings',
                'address' => 'Makati City',
            ],
            [
                'first_name' => 'Anna',
                'last_name' => 'Lopez',
                'contact_number' => '09201234567',
                'email' => 'anna@example.com',
                'company' => null,
                'address' => 'Taguig City',
            ],
            [
                'first_name' => 'Mark',
                'last_name' => 'Villanueva',
                'contact_number' => '09211234567',
                'email' => 'mark@example.com',
                'company' => 'Tech Solutions Inc.',
                'address' => 'Pasig City',
            ],
        ];

        foreach ($clients as &$client) {
            $client['created_at'] = $now;
            $client['updated_at'] = $now;
        }

        DB::table('clients')->insert($clients);
    }
}