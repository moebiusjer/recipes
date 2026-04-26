import { Outlet, Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
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
    <div className="app-shell">
      <header>
        <div className="container">
          <div className="top-bar">
            <h1 className="site-title">RecipeWorld</h1>
            <nav aria-label="Main navigation">
              <ul className="nav-list">
                <li><Link className={isActive("/") ? "active" : ""} to="/">Home</Link></li>
                <li><Link className={isActive("/search") ? "active" : ""} to="/search">Search</Link></li>
                <li><Link className={isActive("/cookbook") ? "active" : ""} to="/cookbook">Cookbook</Link></li>
                <li><Link className={isActive("/create") ? "active" : ""} to="/create">Create</Link></li>
                <li><Link className={isActive("/contact") ? "active" : ""} to="/contact">Contact</Link></li>
                {isLoggedIn ? (
                  <>
                    <li><Link className={isActive("/profile") ? "active" : ""} to="/profile">Profile</Link></li>
                    <li>
                      <button type="button" onClick={handleLogout}>Logout</button>
                    </li>
                  </>
                ) : (
                  <li><Link className={isActive("/login") ? "active" : ""} to="/login">Login</Link></li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer>
        <div className="container">
          <p>© 2026 RecipeWorld. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
