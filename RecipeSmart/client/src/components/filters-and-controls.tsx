import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchFilters } from "@shared/schema";

interface FiltersAndControlsProps {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
}

export default function FiltersAndControls({ filters, setFilters }: FiltersAndControlsProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          <Select 
            value={filters.genre || "all"} 
            onValueChange={(value) => setFilters({ ...filters, genre: value === "all" ? undefined : value })}
          >
            <SelectTrigger className="w-40" data-testid="genre-filter-select">
              <SelectValue placeholder="全ジャンル" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全ジャンル</SelectItem>
              <SelectItem value="japanese">和食</SelectItem>
              <SelectItem value="western">洋食</SelectItem>
              <SelectItem value="chinese">中華</SelectItem>
              <SelectItem value="korean">韓国料理</SelectItem>
              <SelectItem value="italian">イタリアン</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.sortBy} 
            onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="w-48" data-testid="sort-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">材料一致数順</SelectItem>
              <SelectItem value="popular">人気順</SelectItem>
              <SelectItem value="simple">材料数少ない順</SelectItem>
              <SelectItem value="name">料理名順</SelectItem>
            </SelectContent>
          </Select>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox 
              checked={filters.popularOnly}
              onCheckedChange={(checked) => setFilters({ ...filters, popularOnly: !!checked })}
              data-testid="popular-only-checkbox"
            />
            <span className="text-muted-foreground">人気レシピのみ</span>
          </label>
        </div>

        {/* Layout Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">表示:</span>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant={filters.viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="px-3 py-2 text-sm rounded-none"
              onClick={() => setFilters({ ...filters, viewMode: "grid" })}
              data-testid="grid-view-button"
            >
              <i className="fas fa-th"></i>
            </Button>
            <Button
              variant={filters.viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="px-3 py-2 text-sm rounded-none"
              onClick={() => setFilters({ ...filters, viewMode: "list" })}
              data-testid="list-view-button"
            >
              <i className="fas fa-list"></i>
            </Button>
          </div>
          
          <Select 
            value={filters.gridColumns.toString()} 
            onValueChange={(value) => setFilters({ ...filters, gridColumns: parseInt(value) })}
          >
            <SelectTrigger className="w-20" data-testid="grid-columns-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1列</SelectItem>
              <SelectItem value="2">2列</SelectItem>
              <SelectItem value="3">3列</SelectItem>
              <SelectItem value="4">4列</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
