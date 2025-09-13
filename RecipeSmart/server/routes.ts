import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchFiltersSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getAllRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  // Search recipes with filters
  app.post("/api/recipes/search", async (req, res) => {
    try {
      const filters = req.body;
      const recipes = await storage.searchRecipes(filters);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to search recipes" });
    }
  });

  // Get recipe by ID
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const recipe = await storage.getRecipeById(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipe" });
    }
  });

  // Get ingredient suggestions
  app.get("/api/ingredients/suggestions", async (req, res) => {
    try {
      const suggestions = await storage.getIngredientSuggestions();
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredient suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
