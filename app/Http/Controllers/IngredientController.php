<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use Illuminate\Http\JsonResponse;

class IngredientController extends Controller
{
    /**
     * Display a listing of ingredients with their foods.
     */
    public function index(): JsonResponse
    {
        $ingredients = Ingredient::with(['foods'])->get();
        return response()->json($ingredients);
    }

    /**
     * Display the specified ingredient with its foods.
     */
    public function show(Ingredient $ingredient): JsonResponse
    {
        $ingredient->load(['foods']);
        return response()->json($ingredient);
    }

    public function showRemaining(Ingredient $ingredient): JsonResponse
    {
        $remaining = $ingredient->remaining;
        return response()->json($remaining);
    }
} 