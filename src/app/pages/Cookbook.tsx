import { useEffect, useState } from "react";
import { ChefHat, Bookmark } from "lucide-react";
import { RecipeCard } from "../components/RecipeCard";
import { useNavigate } from "react-router";
import { fetchCookbook, isAuthenticated, type CookbookResponse } from "../lib/api";

function toCardRecipe(recipe: CookbookResponse["saved"][number]) {
  return {
    id: String(recipe.id),
    title: recipe.name,
    image: recipe.image_url || "",
    cookTime: recipe.cook_time_minutes != null ? `${recipe.cook_time_minutes} min` : "—",
    servings: recipe.servings ?? 0,
    likes: recipe.review_count,
  };
}

export function Cookbook() {
  const [cookbook, setCookbook] = useState<CookbookResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const loadCookbook = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchCookbook();
        setCookbook(data);
      } catch {
        setError("Could not load cookbook data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadCookbook();
  }, [navigate]);

  if (isLoading) {
    return <div>Loading cookbook...</div>;
  }

  if (error || !cookbook) {
    return <div>{error || "Could not load cookbook."}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Cookbook</h1>
        <p className="text-gray-600 text-lg">Your personal collection of recipes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-md">
          <Bookmark className="w-12 h-12 mb-3 opacity-90" />
          <h3 className="text-2xl font-semibold mb-1">{cookbook.stats.saved_count}</h3>
          <p className="opacity-90">Saved Recipes</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
          <ChefHat className="w-12 h-12 mb-3 opacity-90" />
          <h3 className="text-2xl font-semibold mb-1">{cookbook.stats.posted_count}</h3>
          <p className="opacity-90">My Created Recipes</p>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Bookmark className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-semibold">Saved Recipes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cookbook.saved.map((recipe) => (
            <RecipeCard key={recipe.id} {...toCardRecipe(recipe)} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <ChefHat className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold">My Created Recipes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cookbook.posted.map((recipe) => (
            <RecipeCard key={recipe.id} {...toCardRecipe(recipe)} />
          ))}
        </div>
      </section>
    </div>
  );
}
