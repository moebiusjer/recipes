import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { RecipeCard } from "../components/RecipeCard";
import { fetchRecipes, type RecipeShort } from "../lib/api";

export function Home() {
  const [recipes, setRecipes] = useState<RecipeShort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await fetchRecipes();
        setRecipes(data);
      } catch {
        setError("Couldn't load recipes. Check database :(");
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecipes();
  }, []);


  const featuredRecipes = recipes.slice(0, 3);
  const trendingRecipes = recipes.slice(3, 9);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Discover Amazing Recipes</h1>
        <p className="text-gray-600 text-lg">Browse recipes from other chefs!</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading recipes...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : (
        <>
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={String(recipe.id)}
                  title={recipe.name}
                  image={recipe.image_url || ""}
                  cookTime={recipe.cook_time_minutes != null ? `${recipe.cook_time_minutes} min` : "—"}
                  servings={recipe.servings ?? 0}
                  likes={recipe.review_count}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold">Trending Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={String(recipe.id)}
                  title={recipe.name}
                  image={recipe.image_url || ""}
                  cookTime={recipe.cook_time_minutes != null ? `${recipe.cook_time_minutes} min` : "—"}
                  servings={recipe.servings ?? 0}
                  likes={recipe.review_count}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
