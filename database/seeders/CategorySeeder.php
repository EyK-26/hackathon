<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Italian', 'description' => 'Traditional Italian cuisine'],
            ['name' => 'Seafood', 'description' => 'Fresh seafood dishes'],
            ['name' => 'Vegetarian', 'description' => 'Meat-free dishes'],
            ['name' => 'Desserts', 'description' => 'Sweet treats and desserts'],
            ['name' => 'Salads', 'description' => 'Fresh and healthy salads'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
} 