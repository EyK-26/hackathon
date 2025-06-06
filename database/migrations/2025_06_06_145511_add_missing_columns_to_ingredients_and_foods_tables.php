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
        Schema::table('ingredients', function (Blueprint $table) {
            $table->boolean('is_available')->default(true)->after('category_id');
            $table->integer('stock_quantity')->default(0)->after('is_available');
            $table->float('rating')->default(0)->after('stock_quantity');
        });

        Schema::table('foods', function (Blueprint $table) {
            $table->boolean('is_available')->default(true)->after('category_id');
            $table->integer('preparation_time')->default(0)->after('is_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ingredients', function (Blueprint $table) {
            $table->dropColumn(['is_available', 'stock_quantity', 'rating']);
        });
        Schema::table('foods', function (Blueprint $table) {
            $table->dropColumn(['is_available', 'preparation_time']);
        });
    }
};
