<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories with their foods and ingredients.
     */
    public function index(): JsonResponse
    {
        $categories = Category::with(['foods', 'ingredients'])->get();
        return response()->json($categories);
    }

    /**
     * Display the specified category with its foods and ingredients.
     */
    public function show(Category $category): JsonResponse
    {
        $category->load(['foods', 'ingredients']);
        return response()->json($category);
    }
} 