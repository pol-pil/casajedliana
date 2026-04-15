<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();

            // 👤 Who performed the action
            $table->unsignedBigInteger('user_id');
            $table->string('staff_name');

            // ⚡ What happened
            $table->string('action'); // CHECK_IN, CREATE_BOOKING, etc.

            // 🧾 Context
            $table->string('guest_name');
            $table->string('room_number');

            // 🟢 Status snapshot
            $table->string('status')->nullable(); // pending, checked_in, etc.

            // 🕒 Timestamp
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};