import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Book, Users, UserCheck, Heart} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import BookCard from "../components/cards/BookCard";
import CreateBookModal from "../components/modals/CreateBookModal";

const BASE_URL = "http://localhost:8000";

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BASE_URL}${avatar}`;
};

// ─── Skeletons ────────────────────────────────────────────────────────────────
const BookCardSkeleton = () => (
  <div className="animate-pulse bg-white border border-slate-200 rounded-lg shadow-sm">
    <div className="w-full aspect-[16/25] bg-slate-200 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  </div>
);

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const profileId = userId || currentUser?._id;
  const isOwnProfile = profileId === currentUser?._id;

  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${API_PATHS.SOCIAL.GET_USER_PROFILE}/${profileId}`);
      setProfile(res.data.user);
      setBooks(res.data.books);
      setStats({
        postsCount: res.data.postsCount,
        followersCount: res.data.followersCount,
        followingCount: res.data.followingCount,
      });
      setIsFollowing(res.data.isFollowing);
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axiosInstance.delete(`${API_PATHS.SOCIAL.UNFOLLOW}/${profileId}`);
        setIsFollowing(false);
        setStats((p) => ({ ...p, followersCount: p.followersCount - 1 }));
        toast.success("Unfollowed");
      } else {
        await axiosInstance.post(`${API_PATHS.SOCIAL.FOLLOW}/${profileId}`);
        setIsFollowing(true);
        setStats((p) => ({ ...p, followersCount: p.followersCount + 1 }));
        toast.success("Following!");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)} hideTopbar={true}>

      {/* ── Profile Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center gap-8 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-slate-200 rounded w-40" />
                <div className="h-4 bg-slate-200 rounded w-56" />
                <div className="flex gap-8 mt-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 w-16 bg-slate-200 rounded" />)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                {profile?.avatar ? (
                  <img
                    src={getAvatarUrl(profile.avatar)}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>

                  {/* Follow button — only on other's profile */}
                  {!isOwnProfile && (
                    <button
                      onClick={handleFollow}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all ${isFollowing
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        : "bg-gradient-to-r from-primary to-secondary text-white shadow hover:opacity-90"
                        }`}
                    >
                      {isFollowing
                        ? <><UserCheck size={16} /> Following</>
                        : <><Users size={16} /> Follow</>
                      }
                    </button>
                  )}
                </div>

                <p className="text-gray-500 text-sm mb-2">{profile?.email}</p>

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-gray-700 text-sm mb-4 max-w-md">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex justify-center sm:justify-start gap-8 mt-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{stats.postsCount}</p>
                    <p className="text-sm text-gray-500">Books</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{stats.followersCount}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{stats.followingCount}</p>
                    <p className="text-sm text-gray-500">Following</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Books Section ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Book className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-900 mb-2">No eBooks Yet</p>
            <p className="text-slate-500 max-w-md">No books have been published on this profile yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book._id}>
                <BookCard
                  book={book}
                  onDelete={isOwnProfile ? () => { } : undefined}
                />
                {/* Likes count under card */}
                <div className="flex items-center gap-1 mt-2 px-1">
                  <Heart size={14} fill="#e05c5c" stroke="#e05c5c" />
                  <span className="text-sm text-gray-500 font-medium">
                    {book.likesCount || 0} likes
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CreateBookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookCreated={handleBookCreated}
      />

    </NewDashboardLayout>
  );
};

export default ProfilePage;
