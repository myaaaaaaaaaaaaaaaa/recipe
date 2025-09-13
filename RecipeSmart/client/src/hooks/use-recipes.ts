import { useQuery } from "@tanstack/react-query";
import { Recipe, SearchFilters } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useRecipes(filters: SearchFilters) {
  return useQuery<Recipe[]>({
    queryKey: ["/api/recipes/search", filters],
    queryFn: async () => {
      // If no ingredients selected, get all recipes
      if (filters.selectedIngredients.length === 0) {
        const res = await apiRequest("GET", "/api/recipes");
        let recipes = await res.json();
        
        // Apply other filters
        if (filters.genre) {
          recipes = recipes.filter((recipe: Recipe) => recipe.genre === filters.genre);
        }
        
        if (filters.popularOnly) {
          recipes = recipes.filter((recipe: Recipe) => recipe.isPopular);
        }
        
        // Sort recipes
        recipes.sort((a: Recipe, b: Recipe) => {
          switch(filters.sortBy) {
            case "popular":
              if (b.isPopular !== a.isPopular) {
                return b.isPopular ? 1 : -1;
              }
              return a.name.localeCompare(b.name, 'ja');
            case "simple":
              return a.ingredients.length - b.ingredients.length;
            case "name":
              return a.name.localeCompare(b.name, 'ja');
            default:
              return a.id.localeCompare(b.id);
          }
        });
        
        return recipes;
      }
      
      // Search with ingredients
      const res = await apiRequest("POST", "/api/recipes/search", {
        selectedIngredients: filters.selectedIngredients,
        genre: filters.genre,
        popularOnly: filters.popularOnly,
        sortBy: filters.sortBy
      });
      return await res.json();
    }
  });
}
