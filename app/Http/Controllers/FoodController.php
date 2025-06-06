<?php

namespace App\Http\Controllers;

use App\Models\Food;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodController extends Controller
{
    /**
     * Display a listing of foods with their ingredients.
     */
    public function index(): JsonResponse
    {
        $foods = Food::with(['ingredients', 'category'])->get();
        return response()->json($foods);
    }

    /**
     * Display the specified food with its ingredients.
     */
    public function show(Food $food): JsonResponse
    {
        $food->load(['ingredients', 'category']);
        return response()->json($food);
    }

    public function store(Request $request): JsonResponse
    {
        $food = Food::create($request->all());
        return response()->json($food);
    }
} 