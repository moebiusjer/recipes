import { Outlet, Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Search, BookOpen, User, Home, Plus, Contact as ContactIcon, LogOut, LogIn, CookingPot } from "lucide-react";
import { clearAuthToken, isAuthenticated } from "../lib/api";

export function Layout() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
              <CookingPot className="w-6 h-6 text-orange-600" />
              RecipeWorld
            </Link>

            <div className="flex items-center gap-6">
              <Link
                to="/"
                className={`flex items-center gap-2 transition-colors ${isActive("/") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                to="/search"
                className={`flex items-center gap-2 transition-colors ${isActive("/search") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
              >
                <Search className="w-4 h-4" />
                Search
              </Link>
              <Link
                to="/cookbook"
                className={`flex items-center gap-2 transition-colors ${isActive("/cookbook") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
              >
                <BookOpen className="w-4 h-4" />
                Cookbook
              </Link>
              <Link
                to="/create"
                className={`flex items-center gap-2 transition-colors ${isActive("/create") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
              >
                <Plus className="w-4 h-4" />
                Create
              </Link>
              <Link
                to="/contact"
                className={`flex items-center gap-2 transition-colors ${isActive("/contact") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
              >
                <ContactIcon className="w-4 h-4" />
                Contact
              </Link>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 transition-colors ${isActive("/profile") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className={`flex items-center gap-2 transition-colors ${isActive("/login") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"}`}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-orange-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          © 2026 RecipeWorld. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
