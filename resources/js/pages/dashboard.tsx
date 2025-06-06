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
                    <h2 className="text-2xl font-semibold mb-4">AI Analysis</h2>
                    <p className="text-gray-700">{analysis?.analysis}</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Foods</h3>
                        <p className="text-3xl font-bold text-blue-600">{foods.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Ingredients</h3>
                        <p className="text-3xl font-bold text-green-600">{ingredients.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Categories</h3>
                        <p className="text-3xl font-bold text-purple-600">{categories.length}</p>
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
