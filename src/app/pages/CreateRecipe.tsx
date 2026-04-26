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

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const parsedCookTime = Number.parseInt(cookTime, 10);

    setIsSubmitting(true);
    try {
      await createRecipe({
        name: title,
        image_url: imageUrl || TURKEY_LEG_IMAGE,
        cuisine: description || null,
        cook_time_minutes: Number.isNaN(parsedCookTime) ? null : parsedCookTime,
        servings: Number.parseInt(servings, 10),
        ingredients: ingredients.filter((i) => i.trim() !== ""),
        instructions: instructions.filter((i) => i.trim() !== ""),
        tags: [],
        meal_types: [],
      });
      navigate("/cookbook");
    } catch {
      setError("Could not publish recipe.");
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
  };

  return (
    <div>
      <div>
        <h1>Create New Recipe</h1>
        <p>Share your culinary creation with the world</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">
            Recipe Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
           
            placeholder="e.g., Grandma's Chocolate Chip Cookies"
            required
          />
        </div>

        <div>
          <label htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
           
            placeholder="Brief description of your recipe..."
          />
        </div>

        <div>
          <label htmlFor="imageUrl">
            Recipe Image URL
          </label>
          <div>
            <div>
              <Upload />
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
               
                placeholder="https://example.com/image.jpg (optional)"
              />
            </div>
          </div>
          {imageUrl ? (
            <div>
              <img
                src={imageUrl}
                alt="Recipe preview"
               
                onError={(e) => {
                  e.currentTarget.src = TURKEY_LEG_IMAGE;
                }}
              />
            </div>
          ) : (
            <div>
              <img
                src={TURKEY_LEG_IMAGE}
                alt="Default turkey leg"
               
              />
              <p>
                No image provided? We'll use a fun turkey leg icon by default!
              </p>
            </div>
          )}
        </div>

        <div>
          <div>
            <label htmlFor="cookTime">
              Cook Time (minutes) *
            </label>
            <input
              id="cookTime"
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
             
              placeholder="e.g., 30"
              required
            />
          </div>
          <div>
            <label htmlFor="servings">
              Servings *
            </label>
            <input
              id="servings"
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
             
              placeholder="4"
              required
            />
          </div>
        </div>

        <div>
          <div>
            <label>Ingredients *</label>
            <button
              type="button"
              onClick={addIngredient}
             
            >
              <Plus />
              Add Ingredient
            </button>
          </div>
          <div>
            {ingredients.map((ingredient, index) => (
              <div key={index}>
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                 
                  placeholder={`Ingredient ${index + 1}`}
                  required
                />
                {ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                   
                  >
                    <X />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div>
            <label>Instructions *</label>
            <button
              type="button"
              onClick={addInstruction}
             
            >
              <Plus />
              Add Step
            </button>
          </div>
          <div>
            {instructions.map((instruction, index) => (
              <div key={index}>
                <div>
                  {index + 1}
                </div>
                <textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                 
                  placeholder={`Step ${index + 1} instructions...`}
                  required
                />
                {instructions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                   
                  >
                    <X />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
           
          >
            {isSubmitting ? "Publishing..." : "Publish Recipe"}
          </button>
          <button
            type="button"
            onClick={handleReset}
           
          >
            Reset
          </button>
        </div>
        {error ? <p>{error}</p> : null}
      </form>
    </div>
  );
}
