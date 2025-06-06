<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Food;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            IngredientSeeder::class,
            FoodSeeder::class,
            UpdateFoodsAndIngredientsSeeder::class,
        ]);
    }
}
