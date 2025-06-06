<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Ingredient extends Model
{
    /** @use HasFactory<\Database\Factories\IngredientFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'category_id',
        'is_active',
        'longevity',
        'amount',
        'created_at',
        'updated_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    /**
     * Get the category that owns the ingredient.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the foods that use this ingredient.
     */
    public function foods()
    {
        return $this->belongsToMany(Food::class, 'food_ingredient')
            ->withPivot('quantity', 'unit')
            ->withTimestamps();
    }
}
