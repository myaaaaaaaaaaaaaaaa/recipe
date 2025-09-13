import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe & { matchCount?: number; matchedIngredients?: string[]; matchPercentage?: number };
  selectedIngredients: string[];
  onIngredientClick: (ingredient: string) => void;
  isListView?: boolean;
}

const genreLabels: Record<string, string> = {
  japanese: "和食",
  western: "洋食", 
  chinese: "中華",
  korean: "韓国料理",
  italian: "イタリアン",
  other: "その他"
};

export default function RecipeCard({ recipe, selectedIngredients, onIngredientClick, isListView }: RecipeCardProps) {
  const isIngredientMatched = (ingredientName: string) => {
    return selectedIngredients.some(selected => 
      ingredientName.toLowerCase().includes(selected.toLowerCase()) ||
      selected.toLowerCase().includes(ingredientName.toLowerCase())
    );
  };

  const cardClasses = isListView
    ? "recipe-card bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 fade-in flex"
    : "recipe-card bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 fade-in hover:-translate-y-1";

  return (
    <article className={cardClasses} data-testid={`recipe-card-${recipe.id}`}>
      {/* Recipe Image */}
      <div className={`relative ${isListView ? "w-48 flex-shrink-0" : ""}`}>
        <img 
          src={recipe.photo} 
          alt={recipe.name} 
          className={`object-cover ${isListView ? "w-full h-full" : "w-full h-48"}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400";
          }}
        />
        
        {/* Badges */}
        {recipe.isPopular && (
          <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <i className="fas fa-star"></i>
            人気
          </div>
        )}
        
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground px-2 py-1 rounded-full text-xs font-medium">
          {genreLabels[recipe.genre] || recipe.genre}
        </div>
        
        {recipe.matchPercentage && recipe.matchPercentage > 0 && (
          <div className="absolute bottom-3 right-3 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold">
            材料一致: {recipe.matchCount}/{selectedIngredients.length} ({recipe.matchPercentage}%)
          </div>
        )}
      </div>
      
      <div className={`p-5 ${isListView ? "flex-1" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-foreground">{recipe.name}</h3>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive p-1">
            <i className="far fa-heart"></i>
          </Button>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        {/* Ingredients with Quantities */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <i className="fas fa-list-ul"></i>
            材料 ({recipe.ingredients.length}個)
          </h4>
          <div className={`grid gap-1 text-xs ${isListView ? "grid-cols-3" : "grid-cols-2"}`}>
            {recipe.ingredients.map((ingredient, index) => {
              const isMatched = isIngredientMatched(ingredient.name);
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className={`${
                    isMatched 
                      ? "bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground font-medium" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  } px-2 py-1 h-auto text-left justify-start transition-all duration-200`}
                  onClick={() => onIngredientClick(ingredient.name)}
                  data-testid={`ingredient-${ingredient.name}-${recipe.id}`}
                >
                  {ingredient.emoji} {ingredient.name} {ingredient.quantity}
                </Button>
              );
            })}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {recipe.cookingTime && (
              <span className="flex items-center gap-1">
                <i className="far fa-clock"></i>
                {recipe.cookingTime}分
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <i className="fas fa-users"></i>
                {recipe.servings}人分
              </span>
            )}
          </div>
          <Button size="sm" data-testid={`view-recipe-${recipe.id}`}>
            レシピを見る
          </Button>
        </div>
      </div>
    </article>
  );
}
