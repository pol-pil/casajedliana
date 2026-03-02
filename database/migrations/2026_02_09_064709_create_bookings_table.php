<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->foreignId('receptionist_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('rate_id')
            ->nullable()
            ->constrained()
            ->nullOnDelete();
        
            $table->dateTime('check_in');
            $table->dateTime('check_out');
        
            $table->text('remarks')->nullable();
            $table->string('purpose')->nullable();
           $table->foreignId('booking_type_id')
            ->constrained()
            ->cascadeOnDelete();
        
            $table->integer('guest_count');
            $table->decimal('total_amount', 10, 2);
        
            $table->enum('status', [
                'pencil',
                'reserved',
                'checked_in',
                'checked_out',
                'cancelled'
            ]);
        
            $table->timestamps();
        });        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
