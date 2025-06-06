<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateFoodsAndIngredientsSeeder extends Seeder
{
    public function run(): void
    {
        // Update ingredients with real data
        $ingredients = [
            [
                'name' => 'Olive Oil',
                'description' => 'Extra virgin olive oil, rich in healthy monounsaturated fats and antioxidants.',
                'price' => 12.99,
                'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=640&h=480&fit=crop',
                'category_id' => 1,
                'is_available' => true,
                'stock_quantity' => 50,
                'rating' => 4.8
            ],
            [
                'name' => 'Fresh Basil',
                'description' => 'Aromatic herb with a sweet, slightly peppery flavor, perfect for Italian dishes.',
                'price' => 3.99,
                'image_url' => 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=640&h=480&fit=crop',
                'category_id' => 2,
                'is_available' => true,
                'stock_quantity' => 30,
                'rating' => 4.5
            ],
            [
                'name' => 'Garlic',
                'description' => 'Fresh garlic cloves, essential for adding depth of flavor to many dishes.',
                'price' => 2.49,
                'image_url' => 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=640&h=480&fit=crop',
                'category_id' => 2,
                'is_available' => true,
                'stock_quantity' => 100,
                'rating' => 4.7
            ],
            [
                'name' => 'Sea Salt',
                'description' => 'Natural sea salt with trace minerals, perfect for seasoning and finishing dishes.',
                'price' => 4.99,
                'image_url' => 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=640&h=480&fit=crop',
                'category_id' => 3,
                'is_available' => true,
                'stock_quantity' => 75,
                'rating' => 4.6
            ],
            [
                'name' => 'Black Pepper',
                'description' => 'Freshly ground black peppercorns for adding heat and complexity to dishes.',
                'price' => 3.49,
                'image_url' => 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=640&h=480&fit=crop',
                'category_id' => 3,
                'is_available' => true,
                'stock_quantity' => 60,
                'rating' => 4.5
            ]
        ];

        // Update foods with real data
        $foods = [
            [
                'name' => 'Classic Margherita Pizza',
                'description' => 'Traditional Italian pizza with fresh mozzarella, tomatoes, and basil on a thin, crispy crust.',
                'price' => 14.99,
                'image_url' => 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&h=600&fit=crop',
                'category_id' => 1,
                'preparation_time' => 20,
                'is_available' => true
            ],
            [
                'name' => 'Grilled Salmon',
                'description' => 'Fresh Atlantic salmon fillet grilled to perfection, served with seasonal vegetables and lemon butter sauce.',
                'price' => 24.99,
                'image_url' => 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
                'category_id' => 2,
                'preparation_time' => 25,
                'is_available' => true
            ],
            [
                'name' => 'Vegetable Stir Fry',
                'description' => 'Colorful mix of fresh vegetables stir-fried in a savory sauce, served with steamed rice.',
                'price' => 16.99,
                'image_url' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
                'category_id' => 3,
                'preparation_time' => 15,
                'is_available' => true
            ],
            [
                'name' => 'Chocolate Lava Cake',
                'description' => 'Warm chocolate cake with a molten center, served with vanilla ice cream and fresh berries.',
                'price' => 8.99,
                'image_url' => 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&h=600&fit=crop',
                'category_id' => 4,
                'preparation_time' => 30,
                'is_available' => true
            ],
            [
                'name' => 'Caesar Salad',
                'description' => 'Crisp romaine lettuce with parmesan cheese, croutons, and our signature Caesar dressing.',
                'price' => 12.99,
                'image_url' => 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&h=600&fit=crop',
                'category_id' => 5,
                'preparation_time' => 10,
                'is_available' => true
            ]
        ];

        // Update ingredients
        foreach ($ingredients as $index => $ingredient) {
            DB::table('ingredients')
                ->where('id', $index + 1)
                ->update($ingredient);
        }

        // Update foods
        foreach ($foods as $index => $food) {
            DB::table('foods')
                ->where('id', $index + 1)
                ->update($food);
        }
    }
} 