<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChargeSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        $charges = [

            [
                'id' => 1,
                'name' => 'Soap',
                'value' => 200,
                'type' => 'amenity',
            ],

            [
                'id' => 2,
                'name' => 'Towel',
                'value' => 400,
                'type' => 'amenity',
            ],

            [
                'id' => 3,
                'name' => 'Bathrobe',
                'value' => 250,
                'type' => 'amenity',
            ],

            [
                'id' => 4,
                'name' => 'Blanket/Stain',
                'value' => 210,
                'type' => 'damage',
            ],

            [
                'id' => 5,
                'name' => 'Key',
                'value' => 350,
                'type' => 'damage',
            ],
        ];

        foreach ($charges as &$charge) {
            $charge['created_at'] = now();
            $charge['updated_at'] = now();
        }

        DB::table('charges')->insert($charges);
    }
}