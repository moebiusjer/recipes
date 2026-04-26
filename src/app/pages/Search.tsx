import { useEffect, useMemo, useState } from "react";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { RecipeCard } from "../components/RecipeCard";
import { fetchRecipes, type RecipeShort } from "../lib/api";

export function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
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
        setError("Could not load recipes.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecipes();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(recipes.map((recipe) => recipe.cuisine).filter(Boolean) as string[]))],
    [recipes],
  );

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.cuisine === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div>
        <h1>Search Recipes</h1>
        <p>Find the perfect recipe for any occasion</p>
      </div>

      <div>
        <div>
          <div>
            <SearchIcon />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by recipe name, ingredients, or cuisine..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal />
            Filters
          </button>
        </div>

        {showFilters && (
          <div>
            <label>Category</label>
            <div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <p>
          Found <span>{filteredRecipes.length}</span> recipes
        </p>
      </div>

      {isLoading ? (
        <div>Loading recipes...</div>
      ) : error ? (
        <div>{error}</div>
      ) : filteredRecipes.length > 0 ? (
        <div>
          {filteredRecipes.map((recipe) => (
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
      ) : (
        <div>
          <p>No recipes found matching your search</p>
          <p>Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}
