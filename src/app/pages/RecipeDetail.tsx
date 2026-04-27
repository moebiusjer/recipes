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
        setError("Could not load recipe.");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <ImageWithFallback
            src={recipe.image_url || ""}
            alt={recipe.name}
            className="w-full rounded-lg shadow-md"
          />
        </div>

        <div>
          <div className="mb-6">
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-2">{recipe.name}</h1>
              <p className="text-gray-600">
                {recipe.cuisine ? `${recipe.cuisine} cuisine` : "Recipe from the community"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                title="Likes the recipe"
                aria-label="Likes the recipe"
                className="p-2 rounded-lg border hover:bg-red-50 transition-colors"
              >
                <Heart className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </button>
              <button
                onClick={handleSaveToggle}
                disabled={isSaving}
                title="This recipe will be added to favorites"
                aria-label="This recipe will be added to favorites"
                className="p-2 rounded-lg border hover:bg-yellow-50 transition-colors disabled:opacity-50"
              >
                <Bookmark className={`w-6 h-6 ${isSaved ? "fill-yellow-400 text-yellow-500" : ""}`} />
              </button>
            </div>
          </div>
          {saveError ? <p className="text-red-600 mb-4">{saveError}</p> : null}

          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="font-medium">{recipe.cook_time_minutes ?? 0} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="font-medium">{recipe.servings ?? 0} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-orange-600" />
              <span className="font-medium">{recipe.review_count} reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-600" />
              <span className="font-medium">{recipe.difficulty || "Unknown"}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-600 mt-2 flex-shrink-0" />
                    <span>{ingredient.original_text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="font-semibold text-orange-600 flex-shrink-0">
                      {index + 1}.
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
