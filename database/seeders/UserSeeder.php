<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
    [
        'name' => 'Lance Joseph Arceo',
        'email' => 'arceolancejoseph@gmail.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
        'created_at' => now(),
        'updated_at' => now(),
     ]
    ]);
    }
}