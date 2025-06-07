<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\MenuController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Food routes
Route::get('/foods', [FoodController::class, 'index']);
Route::get('/foods/{food}', [FoodController::class, 'show']);

// Ingredient routes
Route::get('/ingredients', [IngredientController::class, 'index']);
Route::get('/ingredients/{ingredient}', [IngredientController::class, 'show']);

// Analysis route
Route::get('/analyze', [AnalysisController::class, 'analyze']);

// Menu Generation
Route::post('/menu/generate', [MenuController::class, 'generateMenu']);

// Filter ingredients
Route::post('/ingredients/filter', [MenuController::class, 'filterIngredients']); 