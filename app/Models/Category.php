<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    public function ingredients()
    {
        return $this->hasMany(Ingredient::class);
    }

    public function foods()
    {
        return $this->hasMany(Food::class);
    }
} 