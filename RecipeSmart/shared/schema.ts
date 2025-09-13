import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

export const recipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    emoji: z.string().optional()
  })),
  description: z.string(),
  photo: z.string(),
  genre: z.enum(["japanese", "western", "chinese", "korean", "italian", "other"]),
  cookingTime: z.number().optional(),
  servings: z.number().optional(),
  isPopular: z.boolean().default(false),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium")
});

export const ingredientSuggestionSchema = z.object({
  name: z.string(),
  emoji: z.string(),
  usageCount: z.number(),
  category: z.string().optional()
});

export const searchFiltersSchema = z.object({
  selectedIngredients: z.array(z.string()),
  genre: z.string().optional(),
  sortBy: z.enum(["match", "popular", "simple", "name"]).default("match"),
  popularOnly: z.boolean().default(false),
  viewMode: z.enum(["grid", "list"]).default("grid"),
  gridColumns: z.number().min(1).max(4).default(2)
});

export type Recipe = z.infer<typeof recipeSchema>;
export type IngredientSuggestion = z.infer<typeof ingredientSuggestionSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const insertRecipeSchema = createInsertSchema(recipeSchema as any).omit({
  id: true
});

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
