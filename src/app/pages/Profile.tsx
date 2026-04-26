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
      <div>
        <div>
          <div>
            <div>
              <div>
                <User />
              </div>
              <div>
                <h1>{user.username}</h1>
                <p>{user?.email}</p>
                <p>@{profile.username}</p>
              </div>
            </div>
            <button
              onClick={handleEditClick}
             
            >
              <Settings />
              Edit Profile
            </button>
          </div>

        <div>
          <div>
            <div>{profile.posted_count}</div>
            <div>Recipes Created</div>
          </div>
          <div>
            <div>{profile.saved_count}</div>
            <div>Recipes Saved</div>
          </div>
          <div>
            <div>{profile.comments_count}</div>
            <div>Comments</div>
          </div>
        </div>
      </div>

      <section>
        <h2>
        <ListCheck />
        Completed Recipes
        </h2>
        <div>
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
        <div>
          <div>
            <div>
              <h2>Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
               
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div>
                <label htmlFor="editName">
                  Name
                </label>
                <input
                  id="editName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                 
                  required
                />
              </div>

              <div>
                <label htmlFor="editEmail">
                  Email
                </label>
                <input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                 
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                 
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                 
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
