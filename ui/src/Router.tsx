import { Home } from "./pages/Home";
import { HomeHe } from "./pages/HomeHe";
import { NotFound } from "./pages/NotFound";
import { Camera } from "./pages/Camera";
import SettingsPage from './pages/SettingsPage'; // Добавляем импорт
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
      {
        path: "/camera",
        element: <Camera />,
      },
      { // Добавляем новый маршрут для страницы настроек
        path: "/settings",
        element: <SettingsPage />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
