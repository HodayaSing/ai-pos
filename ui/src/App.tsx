import React from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SearchProvider } from "./context/SearchContext";

const App = () => {
  return (
    <SearchProvider>
      <Layout>
        <Outlet />
      </Layout>
    </SearchProvider>
  );
};

export default App;
