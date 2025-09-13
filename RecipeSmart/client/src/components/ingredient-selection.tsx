import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchFilters, IngredientSuggestion } from "@shared/schema";

interface IngredientSelectionProps {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
}

export default function IngredientSelection({ filters, setFilters }: IngredientSelectionProps) {
  const [customIngredient, setCustomIngredient] = useState("");
  const [sortBy, setSortBy] = useState("frequency");

  const { data: suggestions = [] } = useQuery<IngredientSuggestion[]>({
    queryKey: ["/api/ingredients/suggestions"],
  });

  const sortedSuggestions = [...suggestions].sort((a, b) => {
    switch (sortBy) {
      case "alphabetical":
        return a.name.localeCompare(b.name, 'ja');
      case "category":
        return (a.category || "").localeCompare(b.category || "");
      default:
        return b.usageCount - a.usageCount;
    }
  });

  const addIngredient = (ingredient: string) => {
    if (ingredient && !filters.selectedIngredients.includes(ingredient)) {
      setFilters({
        ...filters,
        selectedIngredients: [...filters.selectedIngredients, ingredient]
      });
    }
  };

  const removeIngredient = (ingredient: string) => {
    setFilters({
      ...filters,
      selectedIngredients: filters.selectedIngredients.filter(item => item !== ingredient)
    });
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim()) {
      addIngredient(customIngredient.trim());
      setCustomIngredient("");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <i className="fas fa-carrot text-accent mr-2"></i>
        持っている材料を選択
      </h3>
      
      {/* Popular Ingredients Grid */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-muted-foreground">よく使われる材料</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40" data-testid="ingredient-sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frequency">使用頻度順</SelectItem>
              <SelectItem value="alphabetical">名前順</SelectItem>
              <SelectItem value="category">カテゴリ順</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {sortedSuggestions.map((suggestion) => (
            <Button
              key={suggestion.name}
              variant="outline"
              className="ingredient-tag bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground text-sm px-3 py-2 h-auto transition-all duration-200 justify-start"
              onClick={() => addIngredient(suggestion.name)}
              data-testid={`ingredient-${suggestion.name}`}
            >
              {suggestion.emoji} {suggestion.name}{" "}
              <span className="text-xs opacity-70 ml-1">({suggestion.usageCount})</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div className="flex gap-2 mb-4">
        <Input 
          type="text" 
          placeholder="その他の材料を入力..." 
          value={customIngredient}
          onChange={(e) => setCustomIngredient(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addCustomIngredient()}
          className="flex-1"
          data-testid="custom-ingredient-input"
        />
        <Button 
          onClick={addCustomIngredient}
          data-testid="add-ingredient-button"
        >
          追加
        </Button>
      </div>

      {/* Selected Ingredients */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">選択中の材料</h4>
        <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 bg-muted/30 rounded-lg border border-dashed border-border">
          {filters.selectedIngredients.length === 0 ? (
            <span className="text-muted-foreground italic">材料を選択してください</span>
          ) : (
            filters.selectedIngredients.map((ingredient) => (
              <span
                key={ingredient}
                className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                data-testid={`selected-ingredient-${ingredient}`}
              >
                {ingredient}
                <button 
                  className="hover:bg-primary-foreground/20 rounded-full p-1 transition-colors"
                  onClick={() => removeIngredient(ingredient)}
                  data-testid={`remove-ingredient-${ingredient}`}
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
