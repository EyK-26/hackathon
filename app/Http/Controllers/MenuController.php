<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Food;
use App\Models\Ingredient;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use OpenAI\Laravel\Facades\OpenAI;

class MenuController extends Controller
{
    private $prompt;

    private function generatePrompt(string $timePeriod): string
    {
        // Fetch all available ingredients and foods
        $ingredients = Ingredient::with('foods')->get();
        $foods = Food::with(['ingredients'])->get();

        // Format ingredients list
        $ingredientsList = $ingredients->map(function ($ingredient) {
            return "- {$ingredient->name} (ID: {$ingredient->id})
                Price: \${$ingredient->price}
                Amount: {$ingredient->amount} {$ingredient->unit}";
        })->join("\n");

        // Format foods list
        $foodsList = $foods->map(function ($food) {
            $ingredients = $food->ingredients->pluck('name')->join(', ');
            return "- {$food->name} (ID: {$food->id}): {$ingredients}";
        })->join("\n");

        // Determine meal frequency based on time period
        $mealsPerDay = match($timePeriod) {
            '1-day' => 1,
            '3-days' => 3,
            '7-days' => 7,
            default => 7
        };
        
        // Fetch sales from the last $mealsPerDay days
        $soldIngredients = Sale::where('sold_at', '>=', Carbon::now()->subDays($mealsPerDay))->get()
            ->flatMap(function ($sale) {
                return $sale->food->ingredients->map(function ($ingredient) use ($sale) {
                    return [
                        'id' => $ingredient->id,
                        'name' => $ingredient->name,
                        'quantity' => $ingredient->pivot->quantity * $sale->quantity,
                        'unit' => $ingredient->pivot->unit,
                    ];
                });
            });

        // Calculate remaining inventory
        $remainingIngredients = Ingredient::all()->map(function ($ingredient) use ($soldIngredients) {
            $soldQuantity = $soldIngredients->where('id', $ingredient->id)->sum('quantity');
            return [
                'id' => $ingredient->id,
                'name' => $ingredient->name,
                'remaining' => $ingredient->amount - $soldQuantity,
                'unit' => $ingredient->unit,
            ];
        });

        // Get the top 5 unused ingredients for waste management
        $topUnusedIngredients = $remainingIngredients->sortByDesc('remaining')->take(5);

        // Format waste management ingredients list
        $wasteManagementList = $topUnusedIngredients->map(function ($ingredient) {
            return "- {$ingredient['name']} (ID: {$ingredient['id']}): {$ingredient['remaining']} {$ingredient['unit']}";
        })->join("\n");

        return <<<PROMPT
                    If the promt is too long to generate or there's a risk to max out, please return the first 1000 characters of the prompt.
                    And if you decide to return the first 1000 characters please do not forget to fill the menu array below. It's mapped on the frontend.
                    Create a detailed menu plan for {$timePeriod} with the following requirements:

                    1. Number of meals to plan: {$mealsPerDay}
                    2. Available Ingredients:
                    {$ingredientsList}

                    3. I don't want to create again existing food items. Existing Food Items that we already have in the menu are:
                    {$foodsList}

                    4. Top 5 Unused Ingredients (prioritize these in menu planning):
                    {$wasteManagementList}

                    Please generate a menu that:
                    - Uses the available ingredients efficiently
                    - Creates a good mix of existing and new dishes
                    - Ensures variety and balance in the menu
                    - Takes into account seasonal availability
                    - Prioritizes ingredients that need to be used soon
                    - Uses the top 5 unused ingredients to optimize waste management

                    For each meal, please specify:
                    - Required ingredients
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
            'timePeriod' => 'required|string|in:1-day,3-days,7-days'
        ]);

        try {
            $this->prompt = $this->generatePrompt($request->timePeriod);

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
                'max_tokens' => 4096
            ]);

            $menuData = json_decode($response->choices[0]->message->content, true);

            return response()->json([
                'message' => 'Menu generated successfully',
                'data' => [
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