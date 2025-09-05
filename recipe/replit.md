# 冷蔵庫レシピ検索アプリケーション

## Overview

This is a Japanese recipe discovery web application optimized for ingredient-based recipe searching. The primary use case is helping users find recipes based on ingredients they already have in their refrigerator. The application features a modern, intuitive interface that prioritizes ingredient input and matching, making it easy to discover what you can cook with available ingredients.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a **vanilla JavaScript, HTML, and CSS architecture** with no frameworks or build tools. This approach was chosen for simplicity and minimal dependencies.

**Key Components:**
- **Main Application** (`index.html`, `script.js`, `style.css`): Full-featured recipe viewer with search and sorting
- **Viewer Component** (`viewer/`): Simplified recipe display without advanced features
- **Static Data Storage**: JSON-based recipe data (`recipes.json`)

### Data Management
**JSON-based Data Storage** is used instead of a traditional database:
- **Problem Addressed**: Simple data persistence for a small recipe collection
- **Solution**: Static JSON file containing recipe objects with structured data
- **Pros**: No database setup required, easy to modify, version controllable
- **Cons**: Not suitable for large datasets, no real-time updates, no concurrent write operations

**Recipe Data Structure:**
- Each recipe contains: `id`, `name`, `ingredients` (array), `description`, `photo` (image path)
- Images stored in `images/` directory with fallback to `NO_IMAGE.jpg`

### Client-Side Features
**Search and Filter System:**
- Real-time search across recipe names and ingredients
- Case-insensitive matching using JavaScript string methods
- Instant results display without page reload

**Sorting Capabilities:**
- Multiple sort options: ID order, recipe name alphabetical, ingredient count
- Client-side sorting for immediate response

**Responsive Design:**
- CSS Grid layout for automatic card arrangement
- Mobile-friendly responsive design
- Flexible grid that adapts to screen sizes

### File Organization
**Dual Interface Pattern:**
- Main interface: Full functionality for power users
- Viewer interface: Simplified display for basic browsing
- Shared styling patterns with component-specific variations

## External Dependencies

**None** - The application is designed to run entirely with vanilla web technologies:
- No JavaScript frameworks (React, Vue, etc.)
- No CSS frameworks (Bootstrap, Tailwind, etc.)
- No build tools or package managers
- No external APIs or services
- No database systems

**Static Assets:**
- Recipe images stored locally in `images/` directory
- Fallback image (`NO_IMAGE.jpg`) for missing recipe photos
- All styling and functionality implemented natively