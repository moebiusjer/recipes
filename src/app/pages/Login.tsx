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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CookingPot className="w-12 h-12 text-orange-600" />
          </div>
          <h1 className="text-3xl mb-2">{mode === "signin" ? "Welcome Back!" : "Create Your Account"}</h1>
          <p className="text-gray-600">
            {mode === "signin"
              ? "Sign in to save and access your recipes"
              : "Sign up to save recipes and build your cookbook"}
          </p>
        </div>

        <div className="bg-orange-200 rounded-lg shadow-md p-8">
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`rounded-lg py-2 text-sm ${
                mode === "signin" ? "bg-orange-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`rounded-lg py-2 text-sm ${
                mode === "signup" ? "bg-orange-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" ? (
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Choose a username"
                  required
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
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
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-6 text-center">
            <button
              onClick={handleGuestMode}
              className="text-orange-600 hover:text-orange-700 text-sm"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
