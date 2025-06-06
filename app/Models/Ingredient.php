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
        'price',
        'amount',
        'unit',
    ];

    /**
     * Get the foods that use this ingredient.
     */
    public function foods()
    {
        return $this->belongsToMany(Food::class, 'food_ingredient')
            ->withPivot('quantity');
    }
}
