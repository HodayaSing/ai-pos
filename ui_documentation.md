import { Steps } from 'nextra/components'

# UI Documentation (ui/src)

This document provides an overview of the frontend React application structure and key components found within the `ui/src` directory.

## Core Application Setup

The application is bootstrapped using Vite and React with TypeScript.

*   **`main.tsx`**: The main entry point. It sets up the React root, renders the application, and wraps it with top-level context providers (`LocalizationProvider`, `OrderProvider`).
*   **`App.tsx`**: The root component defining the overall application layout using the `Layout` component. It includes the `SearchProvider` context and uses `<Outlet />` from `react-router-dom` to render the content of the current route.
*   **`Router.tsx`**: Defines the application's routes using `react-router-dom`. It maps URL paths to specific page components.

## Routing

Routes are defined in `Router.tsx` and nested within the `App` component layout.

*   `/`: Renders the `Home` page (likely the main English POS interface).
*   `/he`: Renders the `HomeHe` page (likely the main Hebrew POS interface).
*   `/camera`: Renders the `Camera` page (likely for image capture/product recognition).
*   `*`: Renders the `NotFound` page for any unmatched routes.

## Directory Structure Overview

```
ui/src/
├── assets/         # Static assets like images (e.g., react.svg)
├── components/     # Reusable UI components
├── context/        # React Context providers for global state management
├── hooks/          # Custom React hooks
├── locales/        # Localization files (translations)
├── mocks/          # Mock data or API implementations (e.g., translateApi.ts)
├── pages/          # Top-level page components corresponding to routes
├── services/       # Modules for interacting with the backend API
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── App.css         # Global styles for App component
├── App.tsx         # Root layout component
├── index.css       # Global base styles (e.g., Tailwind base)
├── main.tsx        # Application entry point
├── Router.tsx      # Route definitions
└── vite-env.d.ts   # Vite environment type definitions
```

## Pages (`ui/src/pages/`)

These components represent the main views for different routes.

*   **`Home.tsx`**: The main Point of Sale (POS) interface, likely in English. Displays menu items, categories, and order management.
*   **`HomeHe.tsx`**: The Hebrew version of the main POS interface.
*   **`Camera.tsx`**: Provides an interface for using the device camera, likely for AI-powered product recognition or other image-based interactions.
*   **`NotFound.tsx`**: A standard page displayed when a user navigates to a non-existent route.

## Components (`ui/src/components/`)

Reusable UI elements used across different pages.

*   **`Button.tsx`**: A general-purpose button component.
*   **`CameraView.tsx`**: Component specifically for displaying and interacting with the camera feed. Used in `Camera.tsx`.
*   **`CategoryFilter.tsx`**: Allows users to filter menu items by category.
*   **`ContentContainer.tsx`**: A wrapper component for main content areas, possibly handling padding or layout constraints.
*   **`CreateProductModal.tsx`**: A modal dialog for adding new products/menu items.
*   **`EditProductModal.tsx`**: A modal dialog for editing existing products/menu items.
*   **`LanguageSwitcher.tsx`**: Allows users to switch the application's language (e.g., between English and Hebrew).
*   **`Layout.tsx`**: Defines the main application layout structure (e.g., sidebar, top navigation, main content area). Used in `App.tsx`.
*   **`MenuItem.tsx`**: Displays a single menu item, likely including name, price, image, and an add-to-order button.
*   **`MenuItemGrid.tsx`**: Arranges `MenuItem` components in a grid layout.
*   **`OrderSidebar.tsx`**: A sidebar component displaying the current order details (items, total price, checkout options).
*   **`RecipeRecommendation.tsx`**: Displays recipe suggestions, likely based on items identified via the camera or selected items.
*   **`SelectedItemsBar.tsx`**: Might display currently selected items or provide actions related to selections.
*   **`Sidebar.tsx`**: A general sidebar component, possibly for navigation or filtering options. Part of `Layout.tsx`.
*   **`TopNav.tsx`**: The top navigation bar, potentially including branding, search, or user actions. Part of `Layout.tsx`.

## Context (`ui/src/context/`)

React Context providers for managing global or shared state.

*   **`LocalizationContext.tsx`**: Manages the current language, loads translation files, and provides translation functions (`t`) to the application. Likely uses `i18next` or a similar library.
*   **`OrderContext.tsx`**: Manages the state of the current customer order, including adding/removing items, calculating totals, and potentially handling checkout state.
*   **`SearchContext.tsx`**: Manages the state related to search functionality, such as the search query and filtering results.

## Hooks (`ui/src/hooks/`)

Custom React hooks encapsulating reusable logic.

*   **`useMenu.ts`**: Likely fetches and manages the state for the list of menu items, possibly handling loading, errors, and filtering based on category or search.

## Services (`ui/src/services/`)

Modules responsible for making API calls to the backend.

*   **`aiService.ts`**: Contains functions for interacting with the AI-related backend endpoints (`/api/ai/*`), such as generating images, translating text, recognizing products, and getting recommendations.
*   **`cameraService.ts`**: May contain functions related to camera interactions or processing camera data, potentially interacting with browser APIs or the `/api/ai/recognize-products` endpoint.
*   **`localizationService.ts`**: Might contain functions related to fetching or managing language data, although much of this might be handled within `LocalizationContext.tsx`.
*   **`productService.ts`**: Contains functions for interacting with the product-related backend endpoints (`/api/products/*`), such as fetching, creating, updating, and deleting products.

## Localization (`ui/src/locales/`)

Contains translation files for different languages.

*   **`en/translation.json`**: English translations.
*   **`he/translation.json`**: Hebrew translations.
*   **`README.md`**: Documentation about the localization setup.

## Types (`ui/src/types/`)

Contains custom TypeScript type definitions used throughout the application.

*   **`MenuItem.ts`**: Defines the structure of a menu item object.

## Utils (`ui/src/utils/`)

Contains miscellaneous utility functions.

*   **`priceCalculator.ts`**: Likely contains functions for calculating prices, potentially handling taxes, discounts, or currency formatting.
