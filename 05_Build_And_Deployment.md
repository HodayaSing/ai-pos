# 5. Build and Deployment

This guide covers how to create production-ready builds for both the UI and API components of the `ai-pos` project.

## Building for Production

When you want to deploy your application, you need to create optimized builds instead of running the development servers.

### Building the UI (Frontend)

1.  **Navigate to the root project directory (`ai-pos/`):**
    ```bash
    cd path/to/your/ai-pos
    ```
2.  **Run the build command:**
    ```bash
    npm run build
    ```
    or if you use yarn:
    ```bash
    yarn build
    ```
3.  This command uses Vite to bundle and optimize the React application (HTML, CSS, JavaScript).
4.  The output files will be placed in a `dist/` directory within the root project folder. These are the static files you would deploy to a web server or hosting platform (like Vercel, Netlify, GitHub Pages, etc.).

    > **💡 Tip:** You can preview the production build locally *before* deploying by running `npm run preview` (or `yarn preview`) after the build is complete.

### Building the API (Backend)

1.  **Navigate to the API directory (`ai-pos/api/`):**
    ```bash
    cd path/to/your/ai-pos/api
    ```
2.  **Run the build command:**
    ```bash
    npm run build
    ```
3.  This command uses the TypeScript compiler (`tsc`) to compile the TypeScript code (`.ts` files in `src/`) into JavaScript code (`.js` files).
4.  The output JavaScript files will typically be placed in a `dist/` directory within the `api/` folder (the exact location might be configured in `api/tsconfig.json`).

## Running in Production

### Running the Production UI

The built UI consists of static files (HTML, CSS, JS). You need a web server to serve these files. Deployment platforms like Vercel or Netlify handle this automatically when you connect your repository. If deploying manually, you would configure a server like Nginx or Apache to serve the contents of the `ui/dist/` directory.

### Running the Production API

1.  **Ensure the API is built:** You must have run `npm run build` in the `api/` directory first.
2.  **Set Environment Variables:** On your production server, you need to set the necessary environment variables. This is crucial. At a minimum, you'll need:
    *   `NODE_ENV=production` (Tells Node.js/Express to run in production mode, which is more performant and secure)
    *   `PORT` (The port the server should listen on, e.g., 3000 or 8080)
    *   `AI_API_KEY` (Your actual OpenAI API key)
    *   `AI_MODEL_NAME` (Optional, defaults might apply)
    How you set these depends on your hosting provider (e.g., environment variable settings in Heroku, Vercel, AWS, etc.). **Do not** commit your `.env` file with production secrets.
3.  **Start the server:** From within the `api/` directory on your production server, run:
    ```bash
    npm start
    ```
    This command typically runs the compiled JavaScript entry point (e.g., `node dist/index.js`). Check the `scripts` section in `api/package.json` to see the exact command `npm start` executes.

    > **⚠️ Important:** Running `npm run dev` is **not** suitable for production. It uses tools like `nodemon` for development convenience, which are not optimized or secure for a live environment. Always use `npm start` after building for production.

## Deployment Considerations

*   **Hosting:** Choose hosting platforms that support both static site hosting (for the UI) and Node.js applications (for the API). Examples include Vercel, Netlify (for UI, potentially serverless functions for API), Heroku, Render, AWS, Google Cloud.
*   **Environment Variables:** Securely manage your API keys and other sensitive configuration using your hosting provider's environment variable system.
*   **Database:** If the application involved a database (the READMEs didn't explicitly mention a production database setup, only SQLite which might be for development), you would need to provision and configure a production database service.
*   **CORS (Cross-Origin Resource Sharing):** The production API might need to be configured to allow requests from the domain where the UI is hosted. This is often handled in the Express setup in the API code.

This concludes the basic onboarding guide based on the provided README files. Happy coding!
