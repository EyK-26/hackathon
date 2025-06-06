<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use Illuminate\Database\Seeder;

class IngredientSeeder extends Seeder
{
    public function run(): void
    {
        $ingredients = [
            [
                'name' => 'Olive Oil',
                'price' => 6.50,
                'amount' => 0.5,
                'unit' => 'l',
            ],
            [
                'name' => 'Fresh Basil',
                'price' => 3.99,
                'amount' => 0.1,
                'unit' => 'kg',
            ],
            [
                'name' => 'Garlic',
                'price' => 2.50,
                'amount' => 0.2,
                'unit' => 'kg',
            ],
            [
                'name' => 'Sea Salt',
                'price' => 5.00,
                'amount' => 0.5,
                'unit' => 'kg',
            ],
            [
                'name' => 'Black Pepper',
                'price' => 3.50,
                'amount' => 0.1,
                'unit' => 'kg',
            ],
        ];

        foreach ($ingredients as $ingredient) {
            Ingredient::create($ingredient);
        }
    }
} 