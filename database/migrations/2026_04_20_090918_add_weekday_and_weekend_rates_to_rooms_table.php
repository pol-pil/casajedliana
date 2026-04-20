<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->decimal('weekday_rate', 10, 2)->after('price');
            $table->decimal('weekend_rate', 10, 2)->after('weekday_rate');
        });

        DB::table('rooms')->update([
            'weekday_rate' => DB::raw('price'),
            'weekend_rate' => DB::raw('price'),
        ]);
    }

    public function down(): void
    {
        Schema::table('rooms', function (Blueprint $table) {
            $table->dropColumn(['weekday_rate', 'weekend_rate']);
        });
    }
};
