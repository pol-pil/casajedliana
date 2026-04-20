<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('base_amount', 10, 2)->default(0)->after('total_amount');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('base_amount');
            $table->json('pricing_breakdown')->nullable()->after('discount_amount');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['base_amount', 'discount_amount', 'pricing_breakdown']);
        });
    }
};
