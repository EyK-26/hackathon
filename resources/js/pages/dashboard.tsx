import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Food {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    popularity: number;
    category_id: number;
    is_active: boolean;
    ingredients: Ingredient[];
    category: Category;
}

interface Ingredient {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category_id: number;
    is_active: boolean;
    longevity: number;
    amount: number;
    category: Category;
}

interface Category {
    id: number;
    name: string;
    description: string;
}

interface BaseMenuItem {
    name: string;
    preparation_time: string;
    difficulty_level: string;
    estimated_cost: string;
}

interface SimpleMenuItem extends BaseMenuItem {
    ingredients: {
        id: number;
        name: string;
        amount: number | string;
        price: number | string;
    }[];
}

interface DetailedMenuItem extends BaseMenuItem {
    main_dish: string;
    side_dishes: string[];
    required_ingredients: {
        id: number;
        name: string;
        amount: number | string;
        price: number | string;
    }[];
}

type MenuItem = SimpleMenuItem | DetailedMenuItem;

interface MenuDay {
    day: string;
    meals: MenuItem[];
}

interface MenuResponse {
    menu: MenuDay[];
}

interface ApiResponse {
    message: string;
    data: {
        analysisType: string;
        timePeriod: string;
        status: string;
        menu: MenuDay[];
    };
}

interface Analysis {
    analysis: string;
    data: {
        foods: Food[];
        ingredients: Ingredient[];
        categories: Category[];
    };
}

// Helper function to check if a MenuItem is DetailedMenuItem
function isDetailedMenuItem(item: MenuItem): item is DetailedMenuItem {
    return 'main_dish' in item && 'side_dishes' in item && 'required_ingredients' in item;
}

const Dashboard: React.FC = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisType, setAnalysisType] = useState<string>('');
    const [timePeriod, setTimePeriod] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedMenu, setGeneratedMenu] = useState<MenuResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all data in parallel
                const [foodsRes, ingredientsRes, categoriesRes, analysisRes] = await Promise.all([
                    axios.get('/api/foods'),
                    axios.get('/api/ingredients'),
                    axios.get('/api/categories'),
                    axios.get('/api/analyze')
                ]);

                setFoods(foodsRes.data);
                setIngredients(ingredientsRes.data);
                setCategories(categoriesRes.data);
                setAnalysis(analysisRes.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch data. Please try again later.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleGenerateMenu = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            const response = await axios.post<ApiResponse>('/api/menu/generate', {
                analysisType,
                timePeriod
            });

            if (response.data?.data?.menu) {
                setGeneratedMenu({ menu: response.data.data.menu });
            } else {
                console.error('Invalid response structure:', response.data);
                setError('Generated menu data is invalid. Please try again.');
            }
        } catch (err) {
            console.error('Error generating menu:', err);
            setError('Failed to generate menu. Please try again later.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAnalysisTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAnalysisType(e.target.value);
        setGeneratedMenu(null);
    };

    const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTimePeriod(e.target.value);
        setGeneratedMenu(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

                        {/* Analysis Section */}
                        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold text-black mb-4">AI Analysis</h2>
                            <p className="text-gray-700">{analysis?.analysis}</p>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-blue-600">{`Foods: ${foods.length}`}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-green-600">{`Ingredients: ${ingredients.length}`}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-purple-600">{`Categories: ${categories.length}`}</p>
                            </div>
                        </div>

                        {/* Menu Generation Section */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                            <div className="p-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Generate Menu</h2>
                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    <div className="flex-1">
                                        <label htmlFor="analysisType" className="block text-sm font-medium text-gray-700 mb-1">
                                            Menu Type
                                        </label>
                                        <select
                                            id="analysisType"
                                            value={analysisType}
                                            onChange={handleAnalysisTypeChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                                        >
                                            <option value="">Select Menu Type</option>
                                            <option value="eco-friendly">Eco-Friendly</option>
                                            <option value="customer-pleaser">Customer Pleaser</option>
                                            <option value="cost-effective">Cost-Effective</option>
                                            <option value="surprise-me">Surprise Me</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700 mb-1">
                                            Time Period
                                        </label>
                                        <select
                                            id="timePeriod"
                                            value={timePeriod}
                                            onChange={handleTimePeriodChange}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                                        >
                                            <option value="">Select Time Period</option>
                                            <option value="1-week">1 Week</option>
                                            <option value="2-weeks">2 Weeks</option>
                                            <option value="1-month">1 Month</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleGenerateMenu}
                                            disabled={isGenerating || !analysisType || !timePeriod}
                                            className="w-full sm:w-auto bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isGenerating ? (
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-gray-900">Generating...</span>
                                                </div>
                                            ) : <span className="text-gray-900">Generate Menu</span>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Generated Menu Display */}
                        {generatedMenu && (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {generatedMenu.menu?.map((day, dayIndex) => (
                                            <div key={dayIndex} className="border rounded-lg p-4">
                                                <h3 className="text-xl font-semibold mb-3 text-gray-900">{day.day}</h3>
                                                <div className="space-y-4">
                                                    {day.meals?.map((meal, mealIndex) => (
                                                        <div key={mealIndex} className="bg-gray-50 p-4 rounded-md">
                                                            <h4 className="text-lg font-medium mb-2 text-gray-900">{meal.name}</h4>
                                                            {isDetailedMenuItem(meal) ? (
                                                                <>
                                                                    <div className="mb-2">
                                                                        <h5 className="font-medium text-gray-900">Main Dish:</h5>
                                                                        <p className="text-gray-700">{meal.main_dish}</p>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <h5 className="font-medium text-gray-900">Side Dishes:</h5>
                                                                        <ul className="list-disc list-inside">
                                                                            {meal.side_dishes?.map((side, index) => (
                                                                                <li key={index} className="text-gray-700">{side}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <h5 className="font-medium text-gray-900">Required Ingredients:</h5>
                                                                        <ul className="list-disc list-inside">
                                                                            {meal.required_ingredients?.map((ingredient, ingIndex) => (
                                                                                <li key={ingIndex} className="text-gray-700">
                                                                                    {ingredient.name} - Amount: {ingredient.amount}, Price: {ingredient.price}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="mb-2">
                                                                    <h5 className="font-medium text-gray-900">Ingredients:</h5>
                                                                    <ul className="list-disc list-inside">
                                                                        {meal.ingredients?.map((ingredient, ingIndex) => (
                                                                            <li key={ingIndex} className="text-gray-700">
                                                                                {ingredient.name} - Amount: {ingredient.amount}, Price: {ingredient.price}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                                                <p>Preparation Time: {meal.preparation_time}</p>
                                                                <p>Difficulty: {meal.difficulty_level}</p>
                                                                <p>Estimated Cost: {meal.estimated_cost}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Foods */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Recent Foods</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {foods?.map((food) => (
                                    <div key={food.id} className="bg-white p-6 rounded-lg shadow-md">
                                        <h3 className="text-xl font-semibold mb-2 text-gray-900">{food.name}</h3>
                                        <p className="text-gray-700 mb-2">{food.description}</p>
                                        <p className="text-blue-700 font-semibold">${food.price}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Ingredients */}
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Recent Ingredients</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ingredients?.map((ingredient) => (
                                    <div key={ingredient.id} className="bg-white p-6 rounded-lg shadow-md">
                                        <h3 className="text-xl font-semibold mb-2 text-gray-900">{ingredient.name}</h3>
                                        <p className="text-gray-700 mb-2">{ingredient.description}</p>
                                        <div className="space-y-1">
                                            <p className="text-green-700 font-semibold">
                                                Amount: {ingredient.amount} units
                                            </p>
                                            <p className="text-blue-700 font-semibold">
                                                Price: ${ingredient.price}
                                            </p>
                                            <p className="text-gray-700">
                                                Longevity: {ingredient.longevity} days
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
};

export default Dashboard;
