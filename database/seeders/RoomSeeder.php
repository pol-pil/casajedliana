<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RoomSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        $rooms = [
            // 4 Standard
            ['room_number'=>'203','room_type'=>'Standard','capacity'=>2,'description'=>'1 Double Sized Bed','price'=>1500,'status'=>'available'],
            ['room_number'=>'204','room_type'=>'Standard','capacity'=>2,'description'=>'1 Double Sized Bed','price'=>1500,'status'=>'available'],
            ['room_number'=>'205','room_type'=>'Standard','capacity'=>2,'description'=>'1 Double Sized Bed','price'=>1500,'status'=>'available'],
            ['room_number'=>'206','room_type'=>'Standard','capacity'=>2,'description'=>'1 Double Sized Bed','price'=>1400,'status'=>'cleaning'],

            // 2 Suite
            ['room_number'=>'201','room_type'=>'Suite','capacity'=>2,'description'=>'1 King Sized Bed','price'=>2500,'status'=>'available'],
            ['room_number'=>'202','room_type'=>'Suite','capacity'=>2,'description'=>'1 King Sized Bed','price'=>2600,'status'=>'available'],

            // 2 Quadro
            ['room_number'=>'207','room_type'=>'Quadro','capacity'=>4,'description'=>'2 Double Decker Beds','price'=>3500,'status'=>'available'],
            ['room_number'=>'208','room_type'=>'Quadro','capacity'=>4,'description'=>'2 Double Decker Beds','price'=>3400,'status'=>'available'],

            // 2 Family
            ['room_number'=>'101-102','room_type'=>'Family','capacity'=>2,'description'=>'3 Queen Sized Beds','price'=>3200,'status'=>'available'],
            ['room_number'=>'103-104','room_type'=>'Family','capacity'=>2,'description'=>'3 Queen Sized Beds','price'=>3200,'status'=>'available'],

            // Penthouse
            ['room_number'=>'300','room_type'=>'Penthouse','capacity'=>2,'description'=>'1 King Bed + Pullout + 2 Sofa Beds','price'=>6000,'status'=>'available'],

            // Rest House
            ['room_number'=>'105','room_type'=>'Rest House','capacity'=>8,'description'=>'2 King Beds + 2 Queen Loft Beds','price'=>8000,'status'=>'available'],
        ];

        foreach ($rooms as &$room) {
            $room['created_at'] = $now;
            $room['updated_at'] = $now;
        }

        DB::table('rooms')->insert($rooms);
    }
}