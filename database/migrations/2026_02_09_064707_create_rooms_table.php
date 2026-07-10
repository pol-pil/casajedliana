<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->string('room_type');
            $table->integer('capacity');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('status');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('status');
            $table->index('is_active');
            $table->index('room_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
