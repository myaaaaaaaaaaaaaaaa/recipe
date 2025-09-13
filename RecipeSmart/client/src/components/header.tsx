import { useState } from "react";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <i className="fas fa-utensils text-2xl text-primary"></i>
            <h1 className="text-xl font-bold text-foreground">冷蔵庫レシピ</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={toggleDarkMode}
              data-testid="dark-mode-toggle"
            >
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-muted-foreground`}></i>
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="settings-menu"
            >
              <i className="fas fa-cog text-muted-foreground"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
