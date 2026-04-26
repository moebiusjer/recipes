import { useParams } from "react-router";
import { Clock, Users, Heart, Bookmark, ChefHat } from "lucide-react";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { useEffect, useState } from "react";
import { fetchCookbook, fetchRecipeDetail, isAuthenticated, saveRecipe, unsaveRecipe, type RecipeFull } from "../lib/api";

export function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState<RecipeFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) {
        setError("Recipe not found.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const result = await fetchRecipeDetail(id);
        setRecipe(result);
        if (isAuthenticated()) {
          const cookbook = await fetchCookbook();
          setIsSaved(cookbook.saved.some((savedRecipe) => savedRecipe.id === result.id));
        } else {
          setIsSaved(false);
        }
      } catch {
        setError("Could not load recipe details.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecipe();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!recipe) {
      return;
    }
    if (!isAuthenticated()) {
      setSaveError("Please sign in to save recipes.");
      return;
    }

    setSaveError("");
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveRecipe(recipe.id);
        setIsSaved(false);
      } else {
        await saveRecipe(recipe.id);
        setIsSaved(true);
      }
    } catch {
      setSaveError("Could not update saved recipes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading recipe...</div>;
  }

  if (error || !recipe) {
    return <div>{error || "Recipe not found."}</div>;
  }

  return (
    <div>
      <div>
        <div>
          <ImageWithFallback
            src={recipe.image_url || ""}
            alt={recipe.name}
          />
        </div>

        <div>
          <div>
            <div>
              <h1>{recipe.name}</h1>
              <p>
                {recipe.cuisine ? `${recipe.cuisine} cuisine` : "Recipe from the community"}
              </p>
            </div>
            <div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                title="Likes the recipe"
                aria-label="Likes the recipe"
              >
                <Heart />
              </button>
              <button
                onClick={handleSaveToggle}
                disabled={isSaving}
                title="This recipe will be added to favorites"
                aria-label="This recipe will be added to favorites"
              >
                <Bookmark />
              </button>
            </div>
          </div>
          {saveError ? <p>{saveError}</p> : null}

          <div>
            <div>
              <Clock />
              <span>{recipe.cook_time_minutes ?? 0} min</span>
            </div>
            <div>
              <Users />
              <span>{recipe.servings ?? 0} servings</span>
            </div>
            <div>
              <Heart />
              <span>{recipe.review_count} reviews</span>
            </div>
            <div>
              <ChefHat />
              <span>{recipe.difficulty || "Unknown"}</span>
            </div>
          </div>

          <div>
            <div>
              <h2>Ingredients</h2>
              <ul>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    <div />
                    <span>{ingredient.original_text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2>Instructions</h2>
              <ol>
                {recipe.instructions.map((instruction, index) => (
                  <li key={index}>
                    <span>
                      {index + 1}
                    </span>
                    <span>{instruction.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
