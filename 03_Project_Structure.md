# 3. Understanding the Project Structure

This guide provides an overview of how the `ai-pos` project is organized and the main technologies used.

## Directory Layout

The project has two main parts, located in the root directory (`ai-pos/`) and the `api/` subdirectory:

```
ai-pos/
├── api/               # Backend API (Node.js/Express/TypeScript)
│   ├── src/           # API source code
│   │   ├── controllers/ # Request handling logic
│   │   ├── db/        # Database connection/setup (if applicable)
│   │   ├── models/    # Data structures/schemas (if applicable)
│   │   ├── routes/    # API route definitions
│   │   └── index.ts   # API server entry point
│   ├── .env.example   # Example environment variables
│   ├── package.json   # API dependencies and scripts
│   └── README.md      # API specific documentation
│
├── ui/                # Frontend UI (React/Vite/TypeScript) - Note: In this project, UI code is in the root.
│   ├── src/           # UI source code
│   │   ├── assets/    # Static assets (images, fonts)
│   │   ├── components/ # Reusable React components
│   │   ├── context/   # React context providers
│   │   ├── hooks/     # Custom React hooks
│   │   ├── locales/   # Localization/translation files
│   │   ├── pages/     # Components representing full pages/views
│   │   ├── services/  # Functions for API communication
│   │   ├── App.tsx    # Main App component
│   │   ├── main.tsx   # Application entry point (renders App)
│   │   └── Router.tsx # Defines application routes
│   ├── public/        # Static files served directly
│   ├── index.html     # Main HTML file template
│   ├── package.json   # UI dependencies and scripts
│   └── README.md      # UI specific documentation (this is the root README)
│
├── .gitignore         # Files/folders ignored by Git
└── README.md          # Main project README (covers the UI)
```

**Key Areas:**

*   **`ai-pos/` (Root):** Contains the UI application code (`src/`), configuration files (`package.json`, `vite.config.ts`, etc.), and the main `README.md`.
*   **`ai-pos/api/`:** Contains the backend API code (`src/`), its configuration (`package.json`, `.env.example`), and its own `README.md`.

## Core Technologies

### UI (Frontend - Root Directory)

*   **React:** A JavaScript library for building user interfaces. It uses a component-based architecture.
*   **Vite:** A fast build tool and development server for modern web projects. It provides quick startup and hot module replacement (HMR).
*   **TypeScript:** A superset of JavaScript that adds static typing. This helps catch errors during development and improves code maintainability.
*   **Tailwind CSS:** A utility-first CSS framework that allows for rapid UI development by composing utility classes directly in the HTML/JSX.
*   **React Router:** A library for handling navigation and routing within the React application.

### API (Backend - `api/` Directory)

*   **Node.js:** A JavaScript runtime environment that allows running JavaScript on the server.
*   **Express:** A minimal and flexible Node.js web application framework used to build the API server and define routes.
*   **TypeScript:** Used here as well for the benefits of static typing in the backend code.

## How UI and API Interact

1.  The **UI** (running on `http://localhost:5173`) makes requests to the **API** (running on `http://localhost:3000`).
2.  These requests are typically made using the browser's `fetch` API or a library like `axios` (check the `ui/src/services/` directory).
3.  The **API** receives these requests, processes them (e.g., interacts with an AI model using the `AI_API_KEY`), and sends back a response (usually in JSON format).
4.  The **UI** receives the response and updates the display accordingly (e.g., showing the generated AI text).

Understanding this separation is key: the UI handles what the user sees and interacts with, while the API handles the business logic, data processing, and communication with external services like AI platforms.
