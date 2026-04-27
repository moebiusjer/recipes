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
    <div>
      <div>
        <h1>Discover Recipes</h1>
        <p>Browse recipes from other users!</p>
      </div>

      {isLoading ? (
        <div>Loading recipes...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <>
          <section>
            <h2>Featured Recipes</h2>
            <div>
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
            <div>
              <TrendingUp />
              <h2>Trending Now</h2>
            </div>
            <div>
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
