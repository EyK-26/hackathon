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
}

interface Ingredient {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category_id: number;
    is_active: boolean;
    amount: number;
}

interface SimpleMenuItem {
    name: string;
    price: number;
    ingredients: {
        id: number | null;
        name: string;
        quantity: number;
        unit: string;
    }[];
}

interface MenuResponse {
    foods: SimpleMenuItem[];
}

interface ApiResponse {
    message: string;
    data: {
        timePeriod: string;
        status: string;
        foods: SimpleMenuItem[];
    };
}

interface Analysis {
    analysis: string;
    data: {
        foods: Food[];
        ingredients: Ingredient[];
    };
}

const Dashboard: React.FC = () => {
    const [foods, setFoods] = useState<Food[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timePeriod, setTimePeriod] = useState('');
    const [generatedMenu, setGeneratedMenu] = useState<MenuResponse | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all data in parallel
                const [foodsRes, ingredientsRes, analysisRes] = await Promise.all([
                    axios.get('/api/foods'),
                    axios.get('/api/ingredients'),
                    axios.get('/api/analyze')
                ]);

                setFoods(foodsRes.data);
                setIngredients(ingredientsRes.data);
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
                timePeriod
            });

            if (response.data?.data?.foods) {
                setGeneratedMenu({ foods: response.data.data.foods });
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-blue-600">{`Foods: ${foods.length}`}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-green-600">{`Ingredients: ${ingredients.length}`}</p>
                            </div>
                        </div>

                        {/* Menu Generation Section */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                            <div className="p-6">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Generate Menu</h2>
                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    <div className="flex-1">
                                        <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700 mb-1">
                                            Time Period
                                        </label>
                                        <select
                                            id="timePeriod"
                                            value={timePeriod}
                                            onChange={(e) => {
                                                setTimePeriod(e.target.value);
                                                setGeneratedMenu(null);
                                            }}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                                        >
                                            <option value="">Select Time Period</option>
                                            <option value="1-day">1 Day</option>
                                            <option value="3-days">3 Days</option>
                                            <option value="7-days">7 Days</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            onClick={handleGenerateMenu}
                                            disabled={!timePeriod || isGenerating}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Generating...
                                                </div>
                                            ) : (
                                                "Generate Menu"
                                            )}
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
                                        {generatedMenu.foods?.map((food, foodIndex) => (
                                            <div key={foodIndex} className="bg-gray-50 p-4 rounded-md">
                                                <h4 className="text-lg font-medium mb-2 text-gray-900">{food.name}</h4>
                                                <div className="mb-2">
                                                    <h5 className="font-medium text-gray-900">Ingredients:</h5>
                                                    <ul className="list-disc list-inside">
                                                        {food.ingredients?.map((ingredient, ingIndex) => (
                                                            <li key={ingIndex} className="text-gray-700">
                                                                {ingredient.name} - Quantity: {ingredient.quantity} {ingredient.unit}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    <p>Price: {food.price}</p>
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
