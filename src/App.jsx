import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes/route";

const router = createBrowserRouter(routes, {
  basename: import.meta.env.VITE_APP_BASE_PREFIX || "/",
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
