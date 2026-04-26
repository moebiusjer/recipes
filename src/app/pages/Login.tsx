import React from "react";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { CookingPot } from "lucide-react";
import { fetchCurrentUser, loginWithEmail, saveAuthToken, signup } from "../lib/api";

export function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response =
        mode === "signin"
          ? await loginWithEmail(email, password)
          : await signup({ username, email, password });
      saveAuthToken(response.access_token);
      await fetchCurrentUser();
      navigate("/profile");
    } catch {
      setError(
        mode === "signin"
          ? "Login failed. Please check your email and password."
          : "Account creation failed. Try a different username or email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestMode = () => {
    navigate("/");
  };

  return (
    <div>
      <div>
        <div>
          <div>
            <CookingPot />
          </div>
          <h1>{mode === "signin" ? "Welcome Back!" : "Create Your Account"}</h1>
          <p>
            {mode === "signin"
              ? "Sign in to save and access your recipes"
              : "Sign up to save recipes and build your cookbook"}
          </p>
        </div>

        <div>
          <div>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
             
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
             
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <div>
                <label htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                 
                  placeholder="Choose a username"
                  required
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
               
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
               
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
             
            >
              {isSubmitting
                ? mode === "signin"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "signin"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>
          {error ? <p>{error}</p> : null}

          <div>
            <button
              onClick={handleGuestMode}
             
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
