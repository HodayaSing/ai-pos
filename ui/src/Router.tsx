import { Home } from "./pages/Home";
import { HomeHe } from "./pages/HomeHe";
import { NotFound } from "./pages/NotFound";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";

export const browserRouter = createBrowserRouter([
  {
    element: <App />,    
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/he",
        element: <HomeHe />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
