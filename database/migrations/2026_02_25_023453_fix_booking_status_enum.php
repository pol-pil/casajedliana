<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE bookings 
            MODIFY status ENUM(
                'pencil',
                'reserved',
                'checked_in',
                'checked_out',
                'cancelled'
            )
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE bookings 
            MODIFY status ENUM(
                'reserved',
                'occupied',
                'pencil',
                'completed',
                'cancelled'
            )
        ");
    }
};