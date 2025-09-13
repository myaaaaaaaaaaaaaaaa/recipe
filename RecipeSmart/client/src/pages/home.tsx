import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import IngredientSelection from "@/components/ingredient-selection";
import FiltersAndControls from "@/components/filters-and-controls";
import RecipeGrid from "@/components/recipe-grid";
import { useState } from "react";
import { SearchFilters } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    selectedIngredients: [],
    sortBy: "match",
    popularOnly: false,
    viewMode: "grid",
    gridColumns: 2
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <IngredientSelection 
          filters={filters} 
          setFilters={setFilters} 
        />
        
        <FiltersAndControls 
          filters={filters} 
          setFilters={setFilters} 
        />
        
        <RecipeGrid filters={filters} setFilters={setFilters} />
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          data-testid="scroll-to-top"
        >
          <i className="fas fa-arrow-up text-xl"></i>
        </button>
      </div>
    </div>
  );
}
