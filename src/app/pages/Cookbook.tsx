import { useEffect, useState } from "react";
import { BookOpen, ChefHat, Bookmark } from "lucide-react";
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
    <div>
      <div>
        <h1>My Cookbook</h1>
        <p>Your personal collection of recipes</p>
      </div>

      <div>
        <div>
          <Bookmark />
          <h3>{cookbook.stats.saved_count}</h3>
          <p>Saved Recipes</p>
        </div>
        <div>
          <ChefHat />
          <h3>{cookbook.stats.posted_count}</h3>
          <p>My Created Recipes</p>
        </div>
      </div>

      <section>
        <div>
          <Bookmark />
          <h2>Saved Recipes</h2>
        </div>
        <div>
          {cookbook.saved.map((recipe) => (
            <RecipeCard key={recipe.id} {...toCardRecipe(recipe)} />
          ))}
        </div>
      </section>

      <section>
        <div>
          <ChefHat />
          <h2>My Created Recipes</h2>
        </div>
        <div>
          {cookbook.posted.map((recipe) => (
            <RecipeCard key={recipe.id} {...toCardRecipe(recipe)} />
          ))}
        </div>
      </section>
    </div>
  );
}
