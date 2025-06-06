<?php

namespace Database\Seeders;

use App\Models\Food;
use App\Models\Ingredient;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    public function run(): void
    {
        $foods = Food::factory()->count(30)->create();

        // Attach 3-7 random ingredients to each food
        $foods->each(function ($food) {
            $randomIngredients = Ingredient::inRandomOrder()->take(rand(3, 7))->get();
            $food->ingredients()->attach(
                $randomIngredients->mapWithKeys(function ($ingredient) {
                    return [$ingredient->id => [
                        'quantity' => rand(1, 500) / 100,
                        'unit' => collect(['g', 'kg', 'ml', 'l'])->random()
                    ]];
                })->toArray()
            );
        });
    }
} 