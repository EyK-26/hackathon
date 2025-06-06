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
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

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
            setGeneratedPrompt(''); // Clear previous prompt
            const response = await axios.post('/api/menu/generate', {
                analysisType,
                timePeriod
            });
            console.log('Full menu generation response:', response);
            console.log('Response data:', response.data);
            
            if (response.data && response.data.data && response.data.data.prompt) {
                setGeneratedPrompt(response.data.data.prompt);
            } else {
                console.warn('No prompt found in response:', response.data);
                setError('Generated menu is empty. Please try again.');
            }
        } catch (error) {
            console.error('Error generating menu:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response?.data);
                setError(`Failed to generate menu: ${error.response?.data?.message || error.message}`);
            } else {
                setError('Failed to generate menu. Please try again.');
            }
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

                {/* Analysis Type Selector */}
                <div className="mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <label htmlFor="analysisType" className="block text-sm font-medium text-gray-700 mb-2">
                            Wished Menu Type
                        </label>
                        <select
                            id="analysisType"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-500"
                            value={analysisType}
                            onChange={(e) => setAnalysisType(e.target.value)}
                        >
                            <option value="">Select Analysis Type</option>
                            <option value="eco-friendly">Eco-friendly</option>
                            <option value="customer-pleaser">Customer Pleaser</option>
                            <option value="cost-effective">Cost Effective</option>
                            <option value="surprise-me">Surprise Me</option>
                        </select>
                        {analysisType && (
                            <div className="mt-4">
                                <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Time Period
                                </label>
                                <select
                                    id="timePeriod"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-500"
                                    value={timePeriod}
                                    onChange={(e) => setTimePeriod(e.target.value)}
                                >
                                    <option value="">Select Time Period</option>
                                    <option value="1-week">1 Week</option>
                                    <option value="2-weeks">2 Weeks</option>
                                    <option value="1-month">1 Month</option>
                                </select>
                            </div>
                        )}
                        {analysisType && timePeriod && (
                            <div className="mt-6">
                                <button
                                    type="button"
                                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleGenerateMenu}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Generating...
                                        </div>
                                    ) : 'Generate Menu'}
                                </button>
                                
                                {isGenerating && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <p className="text-gray-600">Generating your menu...</p>
                                    </div>
                                )}
                                
                                {generatedPrompt && !isGenerating && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <h3 className="text-lg font-semibold -2">Generated Prompt:</h3>
                                        <p className="text-gray-700 whitespace-pre-wrap">{generatedPrompt}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Foods */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Recent Foods</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {foods.slice(0, 6).map((food) => (
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
                        {ingredients.slice(0, 6).map((ingredient) => (
                            <div key={ingredient.id} className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold mb-2">{ingredient.name}</h3>
                                <p className="text-gray-600 mb-2">{ingredient.description}</p>
                                <p className="text-green-600 font-semibold">
                                    Amount: {ingredient.amount} units
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
