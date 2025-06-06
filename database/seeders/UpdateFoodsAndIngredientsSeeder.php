<?php

namespace Database\Seeders;

use App\Models\Food;
use App\Models\Ingredient;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateFoodsAndIngredientsSeeder extends Seeder
{
    public function run(): void
    {
        // Attach ingredients to foods
        $foods = Food::all();
        $ingredients = Ingredient::all();

        foreach ($foods as $food) {
            $randomIngredients = $ingredients->random(rand(2, 4));
            $pivotData = $randomIngredients->mapWithKeys(function ($ingredient) {
                return [$ingredient->id => [
                    'quantity' => rand(1, 500) / 100,
                ]];
            })->toArray();

            DB::table('food_ingredient')->insert(
                collect($pivotData)->map(function ($data, $ingredientId) use ($food) {
                    return [
                        'food_id' => $food->id,
                        'ingredient_id' => $ingredientId,
                        'quantity' => $data['quantity'],
                    ];
                })->values()->toArray()
            );
        }
    }
} 