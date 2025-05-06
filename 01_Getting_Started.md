# 1. Getting Started with ai-pos

Welcome to the **ai-pos** project! This guide will help you set up the project on your local machine.

## Overview

The project consists of two main parts:

1.  **UI (User Interface):** A modern React application built with Vite, TypeScript, and Tailwind CSS. This is the frontend part that users interact with. It's located in the root directory.
2.  **API (Application Programming Interface):** A minimal Node.js/Express/TypeScript backend service that handles requests from the UI, including interactions with AI models. It's located in the `api/` directory.

## Prerequisites

Before you begin, make sure you have the following installed:

*   **Node.js:** Version 14 or higher. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm** or **yarn:** These are package managers for Node.js. npm comes bundled with Node.js.

## Step 1: Clone the Repository

First, you need to get the project code onto your computer. Open your terminal or command prompt and run the following command (replace `[repository-url]` with the actual URL of the project's repository):

```bash
git clone [repository-url] ai-pos
```

This command downloads the project into a folder named `ai-pos`. Now, navigate into that folder:

```bash
cd ai-pos
```

> **💡 Tip:** All subsequent commands in this guide should be run from inside the `ai-pos` directory unless specified otherwise.

## Step 2: Install Dependencies

The UI and API have their own dependencies (libraries and tools they need to run). You need to install them separately.

### Install UI Dependencies

Navigate to the root directory (if you're not already there) and run:

```bash
npm install
```

or if you prefer using yarn:

```bash
yarn
```

### Install API Dependencies

Now, navigate into the `api` directory and install its dependencies:

```bash
cd api
npm install
```

> **⚠️ Warning:** Make sure you run `npm install` (or `yarn`) in *both* the root directory (for the UI) and the `api/` directory (for the API). Forgetting one will cause errors later.

## Step 3: Set Up Environment Variables (API)

The API needs configuration settings, like an API key for the AI service, which are stored in an environment file.

1.  **Navigate to the API directory:** If you're not already there from the previous step, run:
    ```bash
    cd api
    ```
    (If you are in the root `ai-pos` directory, just run `cd api`. If you are already in `ai-pos/api`, you don't need to do anything.)

2.  **Create a `.env` file:** This file will hold your secret keys and settings. You can copy the example file:
    *   On macOS/Linux:
        ```bash
        cp .env.example .env
        ```
    *   On Windows (Command Prompt):
        ```bash
        copy .env.example .env
        ```
    *   On Windows (PowerShell):
        ```bash
        Copy-Item .env.example .env
        ```

3.  **Edit the `.env` file:** Open the newly created `.env` file in a text editor. It will look like this:

    ```dotenv
    # Server configuration
    PORT=3000
    NODE_ENV=development

    # OpenAI API configuration
    AI_API_KEY=your_openai_api_key_here
    AI_MODEL_NAME=gpt-3.5-turbo
    ```

4.  **Add your AI API Key:** Replace `your_openai_api_key_here` with your actual OpenAI API key.

    ```dotenv
    AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```

    > **🔒 Security Note:** The `.env` file contains sensitive information like your API key. It's already listed in the `.gitignore` file, which means Git will ignore it, and you should **never** commit this file to version control.

You've now successfully set up the basic configuration! In the next guide, we'll learn how to run the project.
