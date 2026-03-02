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
        Schema::create('charges', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Example: Extra Bed, Late Checkout
            $table->decimal('value', 10, 2); // price per unit
            $table->string('type')->default('fixed'); // fixed or percentage (optional)
            $table->timestamps();
        });
              
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charges');
    }
};
