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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Search Recipes</h1>
        <p className="text-gray-600 text-lg">Find the perfect recipe for any occasion</p>
      </div>

      <div className="bg-orange-100 rounded-lg p-6 mb-8">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by recipe name, ingredients, or cuisine..."
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-3 border rounded-lg transition-colors flex items-center gap-2 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t">
            <label className="block font-medium mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === category
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Found <span className="font-semibold">{filteredRecipes.length}</span> recipes
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading recipes...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No recipes found matching your search</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
}
