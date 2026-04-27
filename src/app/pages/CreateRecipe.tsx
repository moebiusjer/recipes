import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, X, Upload } from "lucide-react";
import { createRecipe, isAuthenticated } from "../lib/api";

const TURKEY_LEG_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/3/30/Putenbein_im_Ofen.jpg";

export function CreateRecipe() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  const updateIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addInstruction = () => setInstructions([...instructions, ""]);
  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };
  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors: Record<string, string> = {};

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Validate title
    if (!title.trim()) {
      errors.title = "Recipe title is required";
    } else if (title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (title.length > 100) {
      errors.title = "Title must be 100 characters or less";
    }

    // Validate cook time
    if (cookTime && Number.isNaN(Number.parseInt(cookTime, 10))) {
      errors.cookTime = "Cook time must be a valid number";
    } else if (cookTime && Number.parseInt(cookTime, 10) <= 0) {
      errors.cookTime = "Cook time must be greater than 0";
    } else if (cookTime && Number.parseInt(cookTime, 10) > 1440) {
      errors.cookTime = "Cook time cannot exceed 1440 minutes (24 hours)";
    }

    // Validate servings
    if (!servings) {
      errors.servings = "Servings is required";
    } else if (Number.isNaN(Number.parseInt(servings, 10))) {
      errors.servings = "Servings must be a valid number";
    } else if (Number.parseInt(servings, 10) <= 0) {
      errors.servings = "Servings must be greater than 0";
    } else if (Number.parseInt(servings, 10) > 100) {
      errors.servings = "Servings cannot exceed 100";
    }

    // Validate ingredients
    const validIngredients = ingredients.filter((i) => i.trim() !== "");
    if (validIngredients.length === 0) {
      errors.ingredients = "At least one ingredient is required";
    }

    // Validate instructions
    const validInstructions = instructions.filter((i) => i.trim() !== "");
    if (validInstructions.length === 0) {
      errors.instructions = "At least one instruction step is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    const parsedCookTime = Number.parseInt(cookTime, 10);

    setIsSubmitting(true);
    try {
      await createRecipe({
        name: title,
        image_url: imageUrl || TURKEY_LEG_IMAGE,
        cuisine: description || null,
        cook_time_minutes: Number.isNaN(parsedCookTime) ? null : parsedCookTime,
        servings: Number.parseInt(servings, 10),
        ingredients: validIngredients,
        instructions: validInstructions,
        tags: [],
        meal_types: [],
      });
      navigate("/cookbook");
    } catch {
      setError("Could not publish recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setCookTime("");
    setServings("");
    setImageUrl("");
    setIngredients([""]);
    setInstructions([""]);
    setFieldErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Recipe</h1>
        <p className="text-gray-600 text-lg">Share your culinary creation with the world</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="mb-6">
          <label htmlFor="title" className="block font-medium mb-2">
            Recipe Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: "" });
            }}
            placeholder="e.g., Grandma's Chocolate Chip Cookies"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.title ? "border-red-500 focus:ring-red-500" : "focus:ring-orange-500"
            }`}
            required
          />
          {fieldErrors.title && <p className="mt-1 text-red-600 text-sm">{fieldErrors.title}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your recipe..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="imageUrl" className="block font-medium mb-2">
            Recipe Image URL
          </label>
          <div>
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg mb-4">
              <Upload className="w-5 h-5 text-orange-600" />
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg (optional)"
                className="flex-1 focus:outline-none"
              />
            </div>
          </div>
          {imageUrl ? (
            <div className="rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Recipe preview"
                onError={(e) => {
                  e.currentTarget.src = TURKEY_LEG_IMAGE;
                }}
                className="w-full h-64 object-cover"
              />
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg bg-orange-50">
              <img
                src={TURKEY_LEG_IMAGE}
                alt="Default turkey leg"
                className="w-32 h-32 mx-auto mb-3 object-cover"
              />
              <p className="text-gray-600">
                No image provided? We'll use a fun turkey leg icon by default!
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="cookTime" className="block font-medium mb-2">
              Cook Time (minutes) *
            </label>
            <input
              id="cookTime"
              type="number"
              value={cookTime}
              onChange={(e) => {
                setCookTime(e.target.value);
                if (fieldErrors.cookTime) setFieldErrors({ ...fieldErrors, cookTime: "" });
              }}
              placeholder="e.g., 30"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.cookTime ? "border-red-500 focus:ring-red-500" : "focus:ring-orange-500"
              }`}
              required
            />
            {fieldErrors.cookTime && <p className="mt-1 text-red-600 text-sm">{fieldErrors.cookTime}</p>}
          </div>
          <div>
            <label htmlFor="servings" className="block font-medium mb-2">
              Servings *
            </label>
            <input
              id="servings"
              type="number"
              value={servings}
              onChange={(e) => {
                setServings(e.target.value);
                if (fieldErrors.servings) setFieldErrors({ ...fieldErrors, servings: "" });
              }}
              placeholder="4"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.servings ? "border-red-500 focus:ring-red-500" : "focus:ring-orange-500"
              }`}
              required
            />
            {fieldErrors.servings && <p className="mt-1 text-red-600 text-sm">{fieldErrors.servings}</p>}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block font-medium">Ingredients *</label>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center gap-1 px-3 py-1 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Ingredient
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => {
                    updateIngredient(index, e.target.value);
                    if (fieldErrors.ingredients) setFieldErrors({ ...fieldErrors, ingredients: "" });
                  }}
                  placeholder={`Ingredient ${index + 1}`}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      removeIngredient(index);
                      if (fieldErrors.ingredients) setFieldErrors({ ...fieldErrors, ingredients: "" });
                    }}
                    className="px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {fieldErrors.ingredients && <p className="mt-2 text-red-600 text-sm">{fieldErrors.ingredients}</p>}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block font-medium">Instructions *</label>
            <button
              type="button"
              onClick={addInstruction}
              className="flex items-center gap-1 px-3 py-1 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </button>
          </div>
          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <textarea
                    value={instruction}
                    onChange={(e) => {
                      updateInstruction(index, e.target.value);
                      if (fieldErrors.instructions) setFieldErrors({ ...fieldErrors, instructions: "" });
                    }}
                    placeholder={`Step ${index + 1} instructions...`}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      removeInstruction(index);
                      if (fieldErrors.instructions) setFieldErrors({ ...fieldErrors, instructions: "" });
                    }}
                    className="flex-shrink-0 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {fieldErrors.instructions && <p className="mt-2 text-red-600 text-sm">{fieldErrors.instructions}</p>}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg transition-colors font-medium"
          >
            {isSubmitting ? "Publishing..." : "Publish Recipe"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
