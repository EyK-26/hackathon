<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Food;
use App\Models\Ingredient;
use Illuminate\Http\JsonResponse;
use OpenAI\Laravel\Facades\OpenAI;

class MenuController extends Controller
{
    private $prompt;

    private function generatePrompt(string $analysisType, string $timePeriod): string
    {
        // Fetch all available ingredients and foods
        $ingredients = Ingredient::with('category')->get();
        $foods = Food::with(['category', 'ingredients'])->get();

        // Format ingredients list
        $ingredientsList = $ingredients->slice(0, 6)->map(function ($ingredient) {
            return "- {$ingredient->name} (ID: {$ingredient->id}, Category: {$ingredient->category->name})
                Price: \${$ingredient->price}
                Amount: {$ingredient->amount}
                Longevity: {$ingredient->longevity} days";
        })->join("\n\n");

        // Format foods list
        $foodsList = $foods->slice(0, 6)->map(function ($food) {
            $ingredients = $food->ingredients->map(function ($ingredient) {
                return "{$ingredient->name} (ID: {$ingredient->id})";
            })->join(', ');
            return "- {$food->name} (ID: {$food->id}, Category: {$food->category->name}): {$ingredients}";
        })->join("\n");

        // Determine menu focus based on analysis type
        $focus = match($analysisType) {
            'eco-friendly' => 'focus on sustainable and environmentally friendly ingredients, minimizing food waste and using seasonal produce',
            'customer-pleaser' => 'focus on popular and well-liked dishes, considering customer preferences and trending food items',
            'cost-effective' => 'focus on cost-efficient ingredients and dishes while maintaining quality and taste',
            'surprise-me' => 'create an innovative and diverse menu that combines different cuisines and cooking styles',
            default => 'create a balanced menu'
        };

        // Determine meal frequency based on time period
        $mealsPerDay = match($timePeriod) {
            '1-week' => 7,
            '2-weeks' => 14,
            '1-month' => 30,
            default => 7
        };

        return <<<PROMPT
                    If the promt is too long to generate or there's a risk to max out, please return the first 1000 characters of the prompt.
                    And if you decide to return the first 1000 characters please do not forget to fill the menu array below. It's mapped on the frontend.
                    Create a detailed menu plan for {$timePeriod} with the following requirements:

                    1. Menu Focus: {$focus}
                    2. Number of meals to plan: {$mealsPerDay}
                    3. Available Ingredients:
                    {$ingredientsList}

                    4. I don't want to create again existing food items. Existing Food Items that we already have in the menu are:
                    {$foodsList}

                    Please generate a menu that:
                    - Uses the available ingredients efficiently
                    - Creates a good mix of existing and new dishes
                    - Ensures variety and balance in the menu
                    - Considers the specified focus area
                    - Provides a good mix of different cuisines and cooking styles
                    - Takes into account seasonal availability
                    - Ensures nutritional balance

                    For each meal, please specify:
                    - Main dish
                    - Side dishes
                    - Required ingredients
                    - Preparation time
                    - Difficulty level
                    - Estimated cost per serving

                    Please format the response as a JSON object with the following structure:
                    {
                        "menu": [
                            {
                                "day": "Day 1",
                                "meals": [
                                    {
                                        "name": "",
                                        "ingredients": [
                                            {
                                                "id": "" // id of the ingredient in the database,
                                                "name": "",
                                                "amount": "",
                                                "price": ""
                                            }
                                        ],
                                        "estimated_cost": ""
                                    }
                                ]
                            }
                        ]
                    }
                    PROMPT;
    }

    public function generateMenu(Request $request): JsonResponse
    {
        $request->validate([
            'analysisType' => 'required|string|in:eco-friendly,customer-pleaser,cost-effective,surprise-me',
            'timePeriod' => 'required|string|in:1-week,2-weeks,1-month'
        ]);

        try {
            $this->prompt = $this->generatePrompt($request->analysisType, $request->timePeriod);

            $response = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional chef and menu planner. Your task is to create detailed menu plans based on available ingredients and specific requirements.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $this->prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 4000
            ]);

            $menuData = json_decode($response->choices[0]->message->content, true);

            return response()->json([
                'message' => 'Menu generated successfully',
                'data' => [
                    'analysisType' => $request->analysisType,
                    'timePeriod' => $request->timePeriod,
                    'status' => 'generated',
                    'menu' => $menuData['menu'] ?? [],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error generating menu',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 