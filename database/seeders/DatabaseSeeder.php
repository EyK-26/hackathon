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
        // Create categories first
        $categories = [
            ['name' => 'Vegetables', 'description' => 'Fresh vegetables'],
            ['name' => 'Fruits', 'description' => 'Fresh fruits'],
            ['name' => 'Meat', 'description' => 'Various meat products'],
            ['name' => 'Dairy', 'description' => 'Dairy products'],
            ['name' => 'Grains', 'description' => 'Various grains and cereals'],
        ];

        $categoryIds = [];
        foreach ($categories as $category) {
            $categoryIds[] = Category::create($category)->id;
        }

        // Create ingredients with valid category IDs
        $ingredients = Ingredient::factory()->count(50)->create([
            'category_id' => fn() => $categoryIds[array_rand($categoryIds)]
        ]);

        // Create foods with valid category IDs
        $foods = Food::factory()->count(30)->create([
            'category_id' => fn() => $categoryIds[array_rand($categoryIds)]
        ]);

        // Attach 3-7 random ingredients to each food
        $foods->each(function ($food) use ($ingredients) {
            $randomIngredients = $ingredients->random(rand(3, 7));
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
