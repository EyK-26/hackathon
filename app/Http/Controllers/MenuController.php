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
        $mealThrashold = match($timePeriod) {
            '1-day' => 1,
            '3-days' => 3,
            '7-days' => 7,
            default => 7
        };
        
        // Fetch sales from the last $mealThrashold days
        $soldIngredients = Sale::where('sold_at', '>=', Carbon::now()->subDays($mealThrashold))->get()
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
        $topUnusedIngredients = $remainingIngredients->sortByDesc('remaining');

        // Format waste management ingredients list
        $wasteManagementList = $topUnusedIngredients->map(function ($ingredient) {
            return "- {$ingredient['name']} (ID: {$ingredient['id']}): {$ingredient['remaining']} {$ingredient['unit']}";
        })->join("\n");

        return <<<PROMPT
                    If the promt is too long to generate or there's a risk to max out, please return the first 1000 characters of the prompt.
                    And if you decide to return the first 1000 characters please do not forget to fill the menu array below. It's mapped on the frontend.
                    Make sure that foods array is NEVER empty.

                    1. Number of meals to plan not more than 5.
                    2. Available Ingredients:
                    {$ingredientsList}

                    3. I don't want to create again existing food items. Existing Food Items that we already have in the menu are:
                    {$foodsList}

                    4. All Remaining Ingredients (prioritize these in menu planning):
                    {$wasteManagementList}

                    Please generate a menu that:
                    - Uses the available ingredients efficiently
                    - Creates a good mix of existing and new dishes
                    - Takes into account seasonal availability of new ingredients
                    - Prioritizes ingredients that need to be used soon
                    - Uses the remaining ingredients to optimize waste management

                    For each meal, please specify:
                    - Required ingredients
                    - Estimated cost per serving (as a number, without any currency sign)

                    Please format the response as a JSON object with the following structure:
                    {
                        "foods": [
                            {
                                "name": "",
                                "price": 0,
                                "ingredients": [
                                    {
                                        "id": "", // with respective id in DB, if not in the remaining ingredients list, use null
                                        "name": "",
                                        "quantity": "",
                                        "unit": ""
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
                        'content' => 'You are a professional chef and menu planner. Your task is to generate meals to optimize waste management. You must ALWAYS return at least one food item in the foods array.'
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

            // Validate and ensure foods array is not empty
            if (empty($menuData['foods'])) {
                // If foods array is empty, generate a fallback menu
                $fallbackResponse = OpenAI::chat()->create([
                    'model' => 'gpt-3.5-turbo',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'You are a professional chef. Generate a simple menu with at least one food item using the available ingredients. This is a fallback response.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $this->prompt
                        ]
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 2048
                ]);

                $fallbackData = json_decode($fallbackResponse->choices[0]->message->content, true);
                
                // If fallback also fails, create a basic food item
                if (empty($fallbackData['foods'])) {
                    $menuData['foods'] = [
                        [
                            'name' => 'Basic Mixed Dish',
                            'price' => 15.00,
                            'ingredients' => [
                                [
                                    'id' => null,
                                    'name' => 'Mixed Ingredients',
                                    'quantity' => '1',
                                    'unit' => 'kg'
                                ]
                            ]
                        ]
                    ];
                } else {
                    $menuData['foods'] = $fallbackData['foods'];
                }
            }

            return response()->json([
                'message' => 'Menu generated successfully',
                'data' => [
                    'timePeriod' => $request->timePeriod,
                    'status' => 'generated',
                    'foods' => $menuData['foods'],
                ]
            ]);
        } catch (\Exception $e) {
            // In case of any error, return a basic food item
            return response()->json([
                'message' => 'Menu generated with fallback due to error',
                'data' => [
                    'timePeriod' => $request->timePeriod,
                    'status' => 'generated',
                    'foods' => [
                        [
                            'name' => 'Emergency Basic Dish',
                            'price' => 15.00,
                            'ingredients' => [
                                [
                                    'id' => null,
                                    'name' => 'Basic Ingredients',
                                    'quantity' => '1',
                                    'unit' => 'kg'
                                ]
                            ]
                        ]
                    ]
                ]
            ]);
        }
    }

    public function filterIngredients(Request $request): JsonResponse
    {
        $request->validate([
            'timePeriod' => 'required|string|in:1-day,3-days,7-days'
        ]);

        try {
            $timePeriod = $request->timePeriod;
            $mealThrashold = match($timePeriod) {
                '1-day' => 1,
                '3-days' => 3,
                '7-days' => 7,
                default => 7
            };

            // Fetch sales from the last $mealThrashold days
            $soldIngredients = Sale::where('sold_at', '>=', Carbon::now()->subDays($mealThrashold))->get()
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

            // Use AI agent to estimate and filter ingredients
            $prompt = $this->buildFilterPrompt($remainingIngredients, $timePeriod);
            $response = OpenAI::chat()->create([
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a professional chef and menu planner. Your task is to guess potential waste based on the given data'
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt
                    ]
                ],
                'temperature' => 0.7,
                'max_tokens' => 4096
            ]);

            $filteredIngredients = json_decode($response->choices[0]->message->content, true);

            // Ensure missing items are filled with default values, except for estimated_waste
            $filteredIngredients['ingredients'] = array_map(function ($ingredient) {
                return [
                    'id' => $ingredient['id'] ?? '',
                    'name' => $ingredient['name'] ?? '',
                    'remaining' => $ingredient['remaining'] ?? 0,
                    'unit' => $ingredient['unit'] ?? 'kg',
                    'estimated_waste' => $ingredient['estimated_waste'] ?? 0
                ];
            }, $filteredIngredients['ingredients'] ?? []);

            return response()->json([
                'message' => 'Ingredients filtered successfully',
                'data' => [
                    'timePeriod' => $request->timePeriod,
                    'status' => 'filtered',
                    'ingredients' => $filteredIngredients['ingredients'] ?? []
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error filtering ingredients',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function buildFilterPrompt($remainingIngredients, $timePeriod): string
    {
        $ingredientsList = $remainingIngredients->map(function ($ingredient) {
            return "- {$ingredient['name']}: {$ingredient['remaining']} {$ingredient['unit']}";
        })->join("\n");

        return <<<PROMPT
                    Determine potential waste based on sales estimation for {$timePeriod} with the following data:

                    1. Available Ingredients:
                    {$ingredientsList}

                    Please analyze the data to:
                    - Identify ingredients that are likely to go to waste based on current sales trends
                    - Estimate the quantity of each ingredient that might remain unused
                    - Suggest potential actions to minimize waste

                    For each ingredient, please specify:
                    - Remaining quantity
                    - Estimated waste based on sales (ensure this is a non-zero value if the ingredient is likely to go to waste)

                    Please format the response as a JSON object with the following structure:
                    {
                        "ingredients": [
                            {
                                "id": "",
                                "name": "",
                                "remaining": 0,
                                "unit": "",
                                "estimated_waste": 0
                            }
                        ]
                    }

                    Ensure the response is a valid JSON object that can be parsed by the UI.
                    PROMPT;
    }
} 