import { Button } from "@/components/ui/button";
import RecipeCard from "./recipe-card";
import { useRecipes } from "@/hooks/use-recipes";
import { SearchFilters } from "@shared/schema";

interface RecipeGridProps {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
}

export default function RecipeGrid({ filters, setFilters }: RecipeGridProps) {
  const { data: recipes = [], isLoading, error } = useRecipes(filters);

  if (error) {
    return (
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="text-center text-destructive">
          <h3 className="text-lg font-semibold mb-2">エラーが発生しました</h3>
          <p>レシピの読み込みに失敗しました。しばらく後でもう一度お試しください。</p>
        </div>
      </div>
    );
  }

  const clearAllIngredients = () => {
    setFilters({
      ...filters,
      selectedIngredients: []
    });
  };

  // Results Summary
  const perfectMatches = recipes.filter((r: any) => 
    r.matchCount === filters.selectedIngredients.length
  ).length;
  const partialMatches = recipes.length - perfectMatches;

  return (
    <>
      {/* Results Summary */}
      {filters.selectedIngredients.length > 0 ? (
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {recipes.length === 0 ? "😅 該当するレシピが見つかりません" : `🎉 ${recipes.length}件のレシピが見つかりました！`}
              </h3>
              <p className="text-sm text-muted-foreground">
                選択材料: <strong>{filters.selectedIngredients.join(', ')}</strong>
                {recipes.length > 0 && (
                  <>
                    {perfectMatches > 0 && <> • <span className="text-accent">✅ 完全一致: {perfectMatches}件</span></>}
                    {partialMatches > 0 && <> • <span className="text-muted-foreground">🔸 部分一致: {partialMatches}件</span></>}
                  </>
                )}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllIngredients}
              data-testid="clear-ingredients-button"
            >
              <i className="fas fa-refresh mr-1"></i>
              リセット
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">🎯 材料を入力してレシピを検索しましょう</h3>
            <p className="text-sm text-muted-foreground">
              冷蔵庫にある材料を上の検索ボックスに入力して、作れる料理を見つけてください。
            </p>
          </div>
        </div>
      )}

      {/* Recipe Grid */}
      <main>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <div className="p-5">
                  <div className="h-6 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 && filters.selectedIngredients.length > 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">レシピが見つかりません</h3>
            <p className="text-muted-foreground mb-4">
              別の材料を試すか、「リセット」ボタンで全てのレシピを見てみましょう。
            </p>
            <Button onClick={clearAllIngredients} data-testid="show-all-recipes-button">
              全てのレシピを表示
            </Button>
          </div>
        ) : (
          <div 
            className={`grid gap-6 ${
              filters.viewMode === "list" 
                ? "grid-cols-1" 
                : `grid-cols-1 ${
                    filters.gridColumns === 1 ? "" :
                    filters.gridColumns === 2 ? "sm:grid-cols-2" :
                    filters.gridColumns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" :
                    "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  }`
            }`}
            data-testid="recipe-grid"
          >
            {recipes.map((recipe: any) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                selectedIngredients={filters.selectedIngredients}
                onIngredientClick={(ingredient) => {
                  if (!filters.selectedIngredients.includes(ingredient)) {
                    setFilters({
                      ...filters,
                      selectedIngredients: [...filters.selectedIngredients, ingredient]
                    });
                  }
                }}
                isListView={filters.viewMode === "list"}
              />
            ))}
          </div>
        )}

        {/* Load More Button - for future pagination */}
        {recipes.length > 0 && recipes.length >= 10 && (
          <div className="text-center mt-8">
            <Button variant="secondary" data-testid="load-more-button">
              さらに表示する
              <i className="fas fa-chevron-down ml-2"></i>
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
