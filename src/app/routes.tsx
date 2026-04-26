import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { RecipeDetail } from "./pages/RecipeDetail";
import { CreateRecipe } from "./pages/CreateRecipe";
import { Search } from "./pages/Search";
import { Cookbook } from "./pages/Cookbook";
import { Contact } from "./pages/Contact";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "profile", Component: Profile },
      { path: "recipe/:id", Component: RecipeDetail },
      { path: "create", Component: CreateRecipe },
      { path: "search", Component: Search },
      { path: "cookbook", Component: Cookbook },
      { path: "contact", Component: Contact },
    ],
  },
]);
