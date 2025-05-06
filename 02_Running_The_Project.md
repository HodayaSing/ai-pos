# 2. Running the Project

Now that you've set up the project and installed dependencies, let's get the UI and API running locally. You'll typically need two separate terminal windows or tabs for this.

## Step 1: Run the API (Backend)

The API needs to be running first so the UI can communicate with it.

1.  **Open a terminal** and navigate to the `api` directory:
    ```bash
    cd path/to/your/ai-pos/api
    ```
    (Replace `path/to/your/ai-pos` with the actual path to the project folder).

2.  **Start the API development server:**
    ```bash
    npm run dev
    ```

3.  You should see output indicating the server is running, likely mentioning `http://localhost:3000`.

    > **💡 Tip:** Keep this terminal window open. Closing it will stop the API server.

## Step 2: Run the UI (Frontend)

1.  **Open a *new* terminal window or tab.**
2.  Navigate to the **root** directory of the project (`ai-pos`):
    ```bash
    cd path/to/your/ai-pos
    ```
3.  **Start the UI development server:**
    ```bash
    npm run dev
    ```
    or if you used yarn:
    ```bash
    yarn dev
    ```
4.  The terminal will show you a local URL, usually `http://localhost:5173`. Open this URL in your web browser.

You should now see the ai-pos application running!

## Troubleshooting Common Issues

Running into problems? Here are some common issues and how to fix them:

*   **Error related to `AI_API_KEY`:**
    *   **Problem:** The API server might crash or log errors mentioning an invalid or missing API key.
    *   **Solution:** Double-check that you created the `.env` file inside the `api/` directory (not the root directory). Ensure you copied the contents from `.env.example` correctly and replaced `your_openai_api_key_here` with your *actual* OpenAI API key. Restart the API server (`npm run dev` in the `api` directory) after fixing the `.env` file.

*   **Port Conflict (Address already in use):**
    *   **Problem:** You might see an error like `Error: listen EADDRINUSE: address already in use :::3000` (or `:::5173`). This means another application is already using the port the API or UI wants to use.
    *   **Solution (API - Port 3000):**
        1.  Stop the current API server (Ctrl+C in its terminal).
        2.  Open the `api/.env` file.
        3.  Change the `PORT` value to something else, e.g., `PORT=3001`.
        4.  Save the file and restart the API server: `npm run dev`. Remember to use this new port if you need to access the API directly.
    *   **Solution (UI - Port 5173):**
        1.  Stop the UI server (Ctrl+C in its terminal).
        2.  Try running `npm run dev -- --port 5174` (or `yarn dev --port 5174`) to specify a different port.
        3.  Alternatively, find and stop the other application using port 5173.

*   **Errors after pulling changes (`git pull`):**
    *   **Problem:** New code might introduce new dependencies or changes that require updates.
    *   **Solution:** Run `npm install` (or `yarn`) in *both* the root directory and the `api/` directory again to install any new dependencies. Then try running the servers again.

*   **UI loads but data doesn't appear / AI features don't work:**
    *   **Problem:** The UI might not be able to connect to the API.
    *   **Solution:**
        1.  Ensure the API server is running (check the terminal you started it in).
        2.  Check the browser's developer console (usually F12) for network errors. See if requests to `http://localhost:3000/api/...` are failing.
        3.  Make sure the API didn't crash due to an error (like the missing API key).

With both the UI and API running, you can start exploring the application. The next guide explains the project's structure.
