const API_BASE_URL = "http://localhost:8000";
const AUTH_TOKEN_KEY = "auth_token";

export interface RecipeShort {
  id: number;
  name: string;
  image_url: string | null;
  cuisine: string | null;
  difficulty: string | null;
  rating: number | null;
  review_count: number;
  cook_time_minutes: number | null;
  servings: number | null;
}

export interface RecipeFull extends RecipeShort {
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  calories_per_serving: number | null;
  author_id: number | null;
  ingredients: Array<{
    original_text: string;
    quantity_text: string | null;
    ingredient: {
      id: number;
      name: string;
      display_name: string;
      category: string | null;
      image_url: string | null;
    };
  }>;
  instructions: Array<{
    step_number: number;
    text: string;
  }>;
  tags: string[];
  meal_types: string[];
}

export interface CreateRecipePayload {
  name: string;
  image_url?: string | null;
  cuisine?: string | null;
  difficulty?: string | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
  calories_per_serving?: number | null;
  ingredients: string[];
  instructions: string[];
  tags?: string[];
  meal_types?: string[];
}

export interface CookbookResponse {
  saved: RecipeShort[];
  posted: RecipeShort[];
  stats: {
    saved_count: number;
    posted_count: number;
    top_ingredients_saved: string[];
    top_ingredients_posted: string[];
  };
}

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
  posted_count: number;
  saved_count: number;
  pantry_count: number;
  comments_count: number;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function saveAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function loginWithEmail(email: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(payload: SignupPayload) {
  return request<LoginResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser() {
  return request<UserResponse>("/auth/me");
}

export async function fetchProfile() {
  return request<ProfileResponse>("/profile");
}

export async function updateProfile(username: string, avatar_url?: string) {
  return request<UserResponse>("/profile", {
    method: "PUT",
    body: JSON.stringify({ username, avatar_url }),
  });
}

export async function fetchCookbook() {
  return request<CookbookResponse>("/cookbook");
}

export async function saveRecipe(recipeId: number) {
  return request<{ ok: boolean }>(`/cookbook/${recipeId}`, {
    method: "POST",
  });
}

export async function unsaveRecipe(recipeId: number) {
  return request<{ ok: boolean }>(`/cookbook/${recipeId}`, {
    method: "DELETE",
  });
}

export async function fetchRecipes(search?: string) {
  const params = new URLSearchParams();
  if (search?.trim()) {
    params.set("q", search.trim());
  }
  const query = params.toString();
  return request<RecipeShort[]>(`/recipes${query ? `?${query}` : ""}`);
}

export async function fetchRecipeDetail(recipeId: string) {
  return request<RecipeFull>(`/recipes/${recipeId}`);
}

export async function createRecipe(payload: CreateRecipePayload) {
  return request<RecipeFull>("/recipes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
