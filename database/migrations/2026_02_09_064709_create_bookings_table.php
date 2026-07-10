<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('client_id')->constrained()->restrictOnDelete();
            $table->foreignId('room_id')->constrained()->restrictOnDelete();
            $table->foreignId('receptionist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('rate_id')->constrained()->restrictOnDelete();
            $table->foreignId('booking_type_id')->nullable()->constrained('booking_types')->nullOnDelete();

            $table->dateTime('check_in');
            $table->dateTime('check_out');

            $table->text('remarks')->nullable();
            $table->string('purpose')->nullable();

            $table->integer('guest_count');
            $table->decimal('total_amount', 10, 2);
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->enum('status', [
                'pencil',
                'confirmed',
                'checked_in',
                'checked_out',
                'no_show',
                'cancelled',
            ])->default('pencil');

            $table->timestamps();

            $table->index('check_in');
            $table->index('check_out');
            $table->index('status');
            $table->index('payment_status');

            $table->index(['room_id', 'check_in', 'check_out']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
