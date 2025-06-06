<?php

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    public function run(): void
    {
        $foods = [
            [
                'name' => 'Pasta Carbonara',
                'price' => 15.99,
            ],
            [
                'name' => 'Chicken Curry',
                'price' => 18.99,
            ],
            [
                'name' => 'Vegetable Stir Fry',
                'price' => 14.99,
            ],
            [
                'name' => 'Beef Steak',
                'price' => 24.99,
            ],
            [
                'name' => 'Salmon Fillet',
                'price' => 22.99,
            ],
        ];

        foreach ($foods as $food) {
            Food::create($food);
        }
    }
} 