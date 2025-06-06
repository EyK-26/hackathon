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

interface MenuItem {
    name: string;
    ingredients: {
        id: string;
        name: string;
        amount: string;
        price: string;
    }[];
    estimated_cost: string;
}

interface MenuDay {
    day: string;
    meals: MenuItem[];
}

interface MenuResponse {
    menu: MenuDay[];
}

interface Analysis {
    analysis: string;
    data: {
        foods: Food[];
        ingredients: Ingredient[];
        categories: Category[];
    };
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
            const response = await axios.post('/api/menu/generate', {
                analysisType,
                timePeriod
            });
            setGeneratedMenu(response.data.data.menu);
        } catch (err) {
            setError('Failed to generate menu. Please try again later.');
            console.error('Error generating menu:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="container mx-auto px-4 py-8">
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
                        <h2 className="text-2xl font-semibold mb-4">Generate Menu</h2>
                        <div className="flex gap-4 mb-4">
                            <select
                                value={analysisType}
                                onChange={(e) => setAnalysisType(e.target.value)}
                                className="rounded-md border-gray-300"
                            >
                                <option value="">Select Analysis Type</option>
                                <option value="eco-friendly">Eco-Friendly</option>
                                <option value="customer-pleaser">Customer Pleaser</option>
                                <option value="cost-effective">Cost-Effective</option>
                                <option value="surprise-me">Surprise Me</option>
                            </select>
                            <select
                                value={timePeriod}
                                onChange={(e) => setTimePeriod(e.target.value)}
                                className="rounded-md border-gray-300"
                            >
                                <option value="">Select Time Period</option>
                                <option value="1-week">1 Week</option>
                                <option value="2-weeks">2 Weeks</option>
                                <option value="1-month">1 Month</option>
                            </select>
                            <button
                                onClick={handleGenerateMenu}
                                disabled={isGenerating || !analysisType || !timePeriod}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
                            >
                                {isGenerating ? 'Generating...' : 'Generate Menu'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Generated Menu Display */}
                {generatedMenu && (
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold mb-4">Generated Menu</h2>
                            <div className="space-y-6">
                                {generatedMenu.menu.map((day, dayIndex) => (
                                    <div key={dayIndex} className="border rounded-lg p-4">
                                        <h3 className="text-xl font-semibold mb-3">{day.day}</h3>
                                        <div className="space-y-4">
                                            {day.meals.map((meal, mealIndex) => (
                                                <div key={mealIndex} className="bg-gray-50 p-4 rounded-md">
                                                    <h4 className="text-lg font-medium mb-2">{meal.name}</h4>
                                                    <div className="mb-2">
                                                        <h5 className="font-medium">Ingredients:</h5>
                                                        <ul className="list-disc list-inside">
                                                            {meal.ingredients.map((ingredient, ingIndex) => (
                                                                <li key={ingIndex}>
                                                                    {ingredient.name} - Amount: {ingredient.amount}, Price: ${ingredient.price}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Estimated Cost: ${meal.estimated_cost}
                                                    </p>
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
                        {foods.map((food) => (
                            <div key={food.id} className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-2">{food.name}</h3>
                                <p className="text-gray-600 mb-2">{food.description}</p>
                                <p className="text-blue-600 font-semibold">${food.price}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Ingredients */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Recent Ingredients</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ingredients.map((ingredient) => (
                            <div key={ingredient.id} className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-2">{ingredient.name}</h3>
                                <p className="text-gray-600 mb-2">{ingredient.description}</p>
                                <div className="space-y-1">
                                    <p className="text-green-600 font-semibold">
                                        Amount: {ingredient.amount} units
                                    </p>
                                    <p className="text-blue-600 font-semibold">
                                        Price: ${ingredient.price}
                                    </p>
                                    <p className="text-gray-600">
                                        Longevity: {ingredient.longevity} days
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
