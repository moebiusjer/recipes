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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CookingPot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{mode === "signin" ? "Welcome Back!" : "Create Your Account"}</h1>
            <p className="text-gray-600">
              {mode === "signin"
                ? "Sign in to save and access your recipes"
                : "Sign up to save recipes and build your cookbook"}
            </p>
          </div>

          <div>
            <div className="flex gap-2 mb-6 border-b">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className={`flex-1 py-3 px-4 transition-colors ${
                  mode === "signin"
                    ? "border-b-2 border-orange-600 text-orange-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
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
                className={`flex-1 py-3 px-4 transition-colors ${
                  mode === "signup"
                    ? "border-b-2 border-orange-600 text-orange-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" ? (
                <div>
                  <label htmlFor="username" className="block font-medium mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="email" className="block font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg transition-colors font-medium"
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
            {error ? <p className="mt-4 text-red-600 text-sm">{error}</p> : null}

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleGuestMode}
                className="w-full text-gray-600 hover:text-gray-900 py-2 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
