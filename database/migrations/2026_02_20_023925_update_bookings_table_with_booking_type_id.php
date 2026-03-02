<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('booking_type_id')->nullable()->after('purpose')->constrained('booking_types')->nullOnDelete();
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('booking_type');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('booking_type')->nullable()->after('purpose');
            $table->dropForeign(['booking_type_id']);
            $table->dropColumn('booking_type_id');
        });
    }
};