import React from "react";
import { useParams } from "react-router";
import { Clock, Users, Heart, Bookmark, ListCheck, ChefHat } from "lucide-react";
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
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading recipe...</div>;
  }

  if (error || !recipe) {
    return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-red-600">{error || "Recipe not found."}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={recipe.image_url || ""}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl mb-3">{recipe.name}</h1>
              <p className="text-gray-600">
                {recipe.cuisine ? `${recipe.cuisine} cuisine` : "Recipe from the community"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                title="Likes the recipe"
                aria-label="Likes the recipe"
                className={`p-3 rounded-lg border transition-colors ${
                  isLiked ? "bg-red-50 border-red-500" : "hover:bg-gray-50"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </button>
              <button
                onClick={handleSaveToggle}
                disabled={isSaving}
                title="This recipe will be added to favorites"
                aria-label="This recipe will be added to favorites"
                className={`p-3 rounded-lg border transition-colors ${
                  isSaved ? "bg-orange-50 border-orange-500" : "hover:bg-gray-50"
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? "text-orange-600" : "text-gray-600"}`} />
              </button>
              {/* <button className="p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <ListCheck className="w-5 h-5 text-gray-600" />
              </button> */}
            </div>
          </div>
          {saveError ? <p className="mb-4 text-sm text-red-600">{saveError}</p> : null}

          <div className="flex items-center gap-6 py-4 border-y mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{recipe.cook_time_minutes ?? 0} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{recipe.servings ?? 0} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-medium">{recipe.review_count} reviews</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <ChefHat className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-600">{recipe.difficulty || "Unknown"}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                    <span>{ingredient.original_text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                    <span className="pt-1">{instruction.text}</span>
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
