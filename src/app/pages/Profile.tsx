import { useEffect, useState } from "react";
import { User, Settings, X, ListCheck } from "lucide-react";
import { RecipeCard } from "../components/RecipeCard";
import { useNavigate } from "react-router";
import {
  fetchCookbook,
  fetchCurrentUser,
  fetchProfile,
  isAuthenticated,
  updateProfile as updateProfileApi,
  type CookbookResponse,
  type ProfileResponse,
  type UserResponse,
} from "../lib/api";

export function Profile() {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [cookbook, setCookbook] = useState<CookbookResponse | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      setPageLoading(true);
      setError("");
      try {
        const [profileData, cookbookData, currentUser] = await Promise.all([
          fetchProfile(),
          fetchCookbook(),
          fetchCurrentUser(),
        ]);
        setProfile(profileData);
        setCookbook(cookbookData);
        setUser(currentUser);
      } catch {
        setError("Could not load profile data.");
      } finally {
        setPageLoading(false);
      }
    };

    void loadData();
  }, [navigate]);

  const handleEditClick = () => {
    setEditName(user?.username || "");
    setEditEmail(user?.email || "");
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfileApi(editName);
      setUser(updatedUser);
      const refreshedProfile = await fetchProfile();
      setProfile(refreshedProfile);
      setShowEditModal(false);
    } catch {
      setError("Could not update profile.");
    }
  };

  if (pageLoading) {
    return <div>Loading profile...</div>;
  }

  if (error || !profile || !cookbook || !user) {
    return <div>{error || "Could not load profile."}</div>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-orange-200 rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                <p className="text-gray-600 mb-1">{user.email}</p>
                <p className="text-sm text-gray-500">@{profile.username}</p>
              </div>
            </div>
            <button
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

        <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t">
          <div className="text-center">
            <div className="text-3xl font-semibold text-orange-600">{profile.posted_count}</div>
            <div className="text-gray-600 text-sm">Recipes Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold text-orange-600">{profile.saved_count}</div>
            <div className="text-gray-600 text-sm">Recipes Saved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-semibold text-orange-600">{profile.comments_count}</div>
            <div className="text-gray-600 text-sm">Comments</div>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <ListCheck className="w-6 h-6 text-orange-600" />
        Completed Recipes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cookbook.posted.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={String(recipe.id)}
              title={recipe.name}
              image={recipe.image_url || ""}
              cookTime={recipe.cook_time_minutes != null ? `${recipe.cook_time_minutes} min` : "—"}
              servings={recipe.servings ?? 0}
              likes={recipe.review_count}
            />
          ))}
        </div>
      </section>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label htmlFor="editName" className="block font-medium mb-2">
                  Name
                </label>
                <input
                  id="editName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="editEmail" className="block font-medium mb-2">
                  Email
                </label>
                <input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
