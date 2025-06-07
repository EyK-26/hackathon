<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
    public function foods(): BelongsToMany
    {
        return $this->belongsToMany(Food::class, 'food_ingredient')
            ->withPivot('quantity');
    }
}
