<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Food extends Model
{
    /** @use HasFactory<\Database\Factories\FoodFactory> */
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'foods';

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
        'popularity',
        'category_id',
        'is_active',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    /**
     * Get the category that owns the food.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the ingredients for the food.
     */
    public function ingredients()
    {
        return $this->belongsToMany(Ingredient::class, 'food_ingredient')
            ->withPivot('quantity', 'unit')
            ->withTimestamps();
    }
}
