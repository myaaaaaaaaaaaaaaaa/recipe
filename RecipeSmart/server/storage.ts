import { Recipe, IngredientSuggestion } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

export interface IStorage {
  getAllRecipes(): Promise<Recipe[]>;
  getRecipeById(id: string): Promise<Recipe | undefined>;
  searchRecipes(filters: {
    selectedIngredients?: string[];
    genre?: string;
    popularOnly?: boolean;
    sortBy?: string;
  }): Promise<Recipe[]>;
  getIngredientSuggestions(): Promise<IngredientSuggestion[]>;
}

export class MemStorage implements IStorage {
  private recipes: Map<string, Recipe>;
  private ingredientSuggestions: IngredientSuggestion[];

  constructor() {
    this.recipes = new Map();
    this.ingredientSuggestions = [];
    this.initializeData();
  }

  private initializeData() {
    // Load user's recipe data from attached file
    this.loadUserRecipeData();
    
    // Calculate ingredient suggestions from recipes
    this.calculateIngredientSuggestions();
  }

  private loadUserRecipeData() {
    // Ingredient emoji mapping
    const ingredientEmojiMap: Record<string, string> = {
      'じゃがいも': '🥔', '玉ねぎ': '🧅', '人参': '🥕', 'ご飯': '🍚', '卵': '🥚',
      'ねぎ': '🧄', 'ハム': '🥓', '醤油': '🥢', 'ごま油': '🛢️', '塩': '🧂',
      'こしょう': '🌶️', 'ケチャップ': '🍅', 'バター': '🧈', '豆腐': '🥇',
      'わかめ': '🌿', '味噌': '🍲', 'だし汁': '🍲', 'キャベツ': '🥬',
      'ピーマン': '🫑', 'もやし': '🌱', '鶏肉': '🐔', '牛肉': '🥩', '豚肉': '🥩',
      'みりん': '🍶', '砂糖': '🍯', 'カレールウ': '🍛', '鯖': '🐟', '大根': '🥬',
      'レモン': '🍋', 'パスタ': '🍝', 'にんにく': '🧄', '鷹の爪': '🌶️',
      'オリーブオイル': '🫒', 'パセリ': '🌿', '小麦粉': '🌾', '片栗粉': '🌾',
      '生姜': '🫚', 'ひき肉': '🥩', 'パン粉': '🍞', '牛乳': '🥛',
      'ウスターソース': '🥫', '中華麺': '🍜', 'きゅうり': '🥒', 'トマト': '🍅',
      '酢': '🧈', 'だし汁': '🍲', 'ソース': '🥫', 'マヨネーズ': '🥗',
      'かつお節': '🐟', '青のり': '🌿', 'キムチ': '🥬', 'ごぼう': '🥕',
      'ごま': '🌰', '油': '🛢️'
    };

    // Genre mapping based on recipe names
    const getGenre = (name: string): "japanese" | "western" | "chinese" | "korean" | "italian" | "other" => {
      if (name.includes('カレー') || name.includes('オムライス') || name.includes('ハンバーグ')) return 'western';
      if (name.includes('チャーハン') || name.includes('マーボー') || name.includes('冷やし中華')) return 'chinese';
      if (name.includes('キムチ')) return 'korean';
      if (name.includes('パスタ') || name.includes('ペペロンチーノ')) return 'italian';
      return 'japanese';
    };

    // Popular recipes mapping
    const popularRecipes = ['肉じゃが', 'チャーハン', 'オムライス', 'カレーライス', '鶏の唐揚げ', 'ハンバーグ'];

    // Load user's recipe data from attached JSON file
    let userRecipeData: any[];
    try {
      const jsonPath = join(process.cwd(), 'attached_assets', 'recipes_1757719656357.json');
      const jsonData = readFileSync(jsonPath, 'utf8');
      userRecipeData = JSON.parse(jsonData);
    } catch (error) {
      console.error('Error loading recipe data from JSON file:', error);
      // Fallback to empty array if file can't be loaded
      userRecipeData = [];
    }

    // Convert user recipe data to new format
    const convertedRecipes: Recipe[] = userRecipeData.map((oldRecipe: any) => {
      const genre = getGenre(oldRecipe.name);
      const isPopular = popularRecipes.includes(oldRecipe.name);
      
      // Convert ingredients to new format with quantities and emojis
      const convertedIngredients = oldRecipe.ingredients.map((ingredient: string) => {
        const emoji = ingredientEmojiMap[ingredient] || '🥘';
        let quantity = '適量'; // default
        
        // Add specific quantities for common ingredients
        if (ingredient === 'ご飯') quantity = '2杯';
        else if (ingredient === '卵') quantity = '2個';
        else if (ingredient === 'じゃがいも' || ingredient === '玉ねぎ') quantity = '1個';
        else if (ingredient === '人参') quantity = '1本';
        else if (ingredient.includes('肉')) quantity = '200g';
        else if (ingredient === '醤油') quantity = '大さじ2';
        else if (ingredient === 'ごま油') quantity = '小さじ1';
        else if (ingredient === '塩' || ingredient === 'こしょう') quantity = '少々';

        return {
          name: ingredient,
          quantity,
          emoji
        };
      });

      return {
        id: oldRecipe.id,
        name: oldRecipe.name,
        ingredients: convertedIngredients,
        description: oldRecipe.description,
        photo: oldRecipe.photo.includes('unsplash') ? oldRecipe.photo : 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400',
        genre,
        cookingTime: isPopular ? 30 : 20,
        servings: Math.ceil(Math.random() * 3) + 2, // 2-5人分
        isPopular,
        difficulty: oldRecipe.ingredients.length > 6 ? 'medium' : 'easy'
      } as Recipe;
    });

    // Initialize recipes
    convertedRecipes.forEach(recipe => {
      this.recipes.set(recipe.id, recipe);
    });
  }

  private calculateIngredientSuggestions() {
    const ingredientCount = new Map<string, { count: number; emoji: string }>();

    this.recipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const key = ingredient.name;
        const current = ingredientCount.get(key);
        if (current) {
          current.count++;
        } else {
          ingredientCount.set(key, { count: 1, emoji: ingredient.emoji || "🥘" });
        }
      });
    });

    this.ingredientSuggestions = Array.from(ingredientCount.entries())
      .map(([name, data]) => ({
        name,
        emoji: data.emoji,
        usageCount: data.count
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 20); // Top 20 ingredients
  }

  async getAllRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async searchRecipes(filters: {
    selectedIngredients?: string[];
    genre?: string;
    popularOnly?: boolean;
    sortBy?: string;
  }): Promise<Recipe[]> {
    let recipes = Array.from(this.recipes.values());

    // Filter by genre
    if (filters.genre && filters.genre !== "") {
      recipes = recipes.filter(recipe => recipe.genre === filters.genre);
    }

    // Filter by popular only
    if (filters.popularOnly) {
      recipes = recipes.filter(recipe => recipe.isPopular);
    }

    // Filter and score by ingredients
    if (filters.selectedIngredients && filters.selectedIngredients.length > 0) {
      const selectedIngredients = filters.selectedIngredients;
      
      recipes = recipes.map(recipe => {
        let matchCount = 0;
        const matchedIngredients: string[] = [];

        selectedIngredients.forEach(selectedIng => {
          const found = recipe.ingredients.find(recipeIng => 
            recipeIng.name.toLowerCase().includes(selectedIng.toLowerCase()) ||
            selectedIng.toLowerCase().includes(recipeIng.name.toLowerCase())
          );
          if (found) {
            matchCount++;
            matchedIngredients.push(found.name);
          }
        });

        return {
          ...recipe,
          matchCount,
          matchedIngredients,
          matchPercentage: Math.round((matchCount / selectedIngredients.length) * 100)
        } as Recipe & { matchCount: number; matchedIngredients: string[]; matchPercentage: number };
      }).filter(recipe => (recipe as any).matchCount > 0);
    }

    // Sort recipes
    const sortBy = filters.sortBy || "match";
    recipes.sort((a: any, b: any) => {
      switch(sortBy) {
        case "match":
          if (b.matchCount !== a.matchCount) {
            return b.matchCount - a.matchCount;
          }
          return a.ingredients.length - b.ingredients.length;
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

  async getIngredientSuggestions(): Promise<IngredientSuggestion[]> {
    return this.ingredientSuggestions;
  }
}

export const storage = new MemStorage();
