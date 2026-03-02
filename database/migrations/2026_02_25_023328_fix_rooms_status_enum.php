<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
{
    // STEP 1: Convert old booking-based statuses to available
    DB::statement("
        UPDATE rooms 
        SET status = 'available' 
        WHERE status IN ('occupied','reserved','pencil')
    ");

    // STEP 2: Now safely modify ENUM
    DB::statement("
        ALTER TABLE rooms 
        MODIFY status ENUM('available','cleaning','maintenance') 
        DEFAULT 'available'
    ");
}
};