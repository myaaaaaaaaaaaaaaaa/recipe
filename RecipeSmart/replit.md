# Recipe Search Application

## Overview

This is a Japanese recipe discovery application that allows users to find recipes based on available ingredients. The application is built with a full-stack TypeScript architecture using React on the frontend and Express.js on the backend. Users can input ingredients they have at home and discover recipes they can make, with features like filtering by cuisine type, sorting options, and ingredient-based matching algorithms.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system variables and responsive design
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular components with separation of concerns (header, hero, ingredient selection, recipe grid, filters)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for recipe search, ingredient suggestions, and CRUD operations
- **Storage**: In-memory storage implementation with interface for future database integration
- **Request Handling**: Structured error handling and logging middleware

### Data Storage Solutions
- **Current**: In-memory storage with Map-based recipe storage
- **Configured**: Drizzle ORM with PostgreSQL setup (using Neon Database)
- **Schema**: Zod schemas for runtime validation and type safety
- **Migration**: Drizzle Kit for database migrations and schema management

### Authentication and Authorization
- **Current**: No authentication implemented
- **Session Management**: Connect-pg-simple configured for PostgreSQL session storage
- **Security**: Basic CORS and request validation

### Design System
- **Theme**: Custom color palette with warm, food-focused design
- **Typography**: Inter font family with multiple weight variations
- **Icons**: Font Awesome icons for UI elements
- **Responsive**: Mobile-first approach with breakpoint-based layouts
- **Dark Mode**: Built-in dark mode support with CSS variables

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **Build Tools**: Vite with TypeScript, PostCSS, and Tailwind CSS
- **Backend**: Express.js with TypeScript support via tsx

### UI and Styling
- **Component Library**: Radix UI primitives for accessibility-compliant components
- **Styling**: Tailwind CSS with custom configuration and Shadcn/ui component system
- **Icons**: Font Awesome 6.4.0 for iconography
- **Animations**: CSS-based animations with Tailwind utilities

### Database and Storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Neon Database serverless platform
- **Validation**: Zod for schema validation and type inference
- **Sessions**: Connect-pg-simple for PostgreSQL session management

### Development Tools
- **TypeScript**: Full TypeScript setup with strict configuration
- **Replit Integration**: Vite plugins for Replit development environment
- **Code Quality**: ESLint configuration for code standards
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

### Recipe Data Integration
- **Current**: Static JSON data loaded from attached assets
- **Format**: Japanese recipe data with ingredients, cooking instructions, and metadata
- **Features**: Ingredient matching algorithms, genre classification, and popularity scoring