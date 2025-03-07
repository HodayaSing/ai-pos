import React from "react";
import ReactDOM from "react-dom/client";
import { browserRouter } from "./Router";
import { RouterProvider } from "react-router-dom";
import { OrderProvider } from "./context/OrderContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <OrderProvider>
    <RouterProvider router={browserRouter} />
  </OrderProvider>
);
