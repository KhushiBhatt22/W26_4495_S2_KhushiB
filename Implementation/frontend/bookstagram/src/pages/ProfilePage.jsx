import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Book, Users, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import BookCard from "../components/cards/BookCard";
import CreateBookModal from "../components/modals/CreateBookModal";
import SurveyModal from "../components/modals/SurveyModal";

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

// ── Component ─────────────────────────────────────────────────────────────────
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

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers"); // "followers" | "following"
  const [followModalList, setFollowModalList] = useState([]);
  const [followModalLoading, setFollowModalLoading] = useState(false);
  const [surveyBookId, setSurveyBookId] = useState(null);


  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${API_PATHS.SOCIAL.GET_USER_PROFILE}/${profileId}`);
      setProfile(res.data.user);
      setBooks(res.data.books || []);
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
  useEffect(() => {
    const pendingBookId = localStorage.getItem("pendingSurveyBookId");
    if (pendingBookId) {
      setSurveyBookId(pendingBookId);
      localStorage.removeItem("pendingSurveyBookId");
    }
  }, []);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axiosInstance.delete(`${API_PATHS.SOCIAL.UNFOLLOW}/${profileId}`);
        setIsFollowing(false);
        setStats((p) => ({ ...p, followersCount: Math.max(0, p.followersCount - 1) }));
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
    localStorage.setItem("newlyCreatedBookId", bookId); // ← mark as new
    navigate(`/editor/${bookId}`);
  };
  const handleDeleteBook = async (bookId) => {
    try {
      await axiosInstance.delete(`${API_PATHS.BOOKS.DELETE_BOOK}/${bookId}`);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      setStats((p) => ({ ...p, postsCount: Math.max(0, p.postsCount - 1) }));
      toast.success("Book deleted");
    } catch {
      toast.error("Failed to delete book");
    }
  };

  const fetchFollowList = async (type) => {
    setFollowModalType(type);
    setShowFollowModal(true);
    setFollowModalLoading(true);
    try {
      const endpoint = type === "followers"
        ? `${API_PATHS.SOCIAL.GET_FOLLOWERS}/${profileId}`
        : `${API_PATHS.SOCIAL.GET_FOLLOWING}/${profileId}`;
      const res = await axiosInstance.get(endpoint);
      setFollowModalList(res.data || []);
    } catch {
      toast.error("Failed to load list");
    } finally {
      setFollowModalLoading(false);
    }
  };
  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)} hideTopbar={true}>
      {surveyBookId && (
        <SurveyModal
          bookId={surveyBookId}
          onClose={() => {
            const id = surveyBookId;
            setSurveyBookId(null);
            navigate(`/editor/${id}`);
          }}
        />
      )}
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
                </div>

                <p className="text-gray-500 text-sm mb-2">{profile?.email}</p>

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-gray-700 text-sm mb-4 max-w-md">{profile.bio}</p>
                )}

                {/* Follow + Message buttons — below bio */}
                {!isOwnProfile && (
                  <div className="flex gap-3 mt-2 mb-4">
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
                    <button
                      onClick={() => navigate("/messages", { state: { openChat: profile } })}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                    >
                     Message
                    </button>
                  </div>
                )}
                {/* Stats */}
                <div className="flex justify-center sm:justify-start gap-8 mt-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{stats.postsCount}</p>
                    <p className="text-sm text-gray-500">Books</p>
                  </div>
                  <div
                    className="text-center cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => fetchFollowList("followers")}
                  >
                    <p className="text-xl font-bold text-gray-900">{stats.followersCount}</p>
                    <p className="text-sm text-gray-500 underline">Followers</p>
                  </div>
                  <div
                    className="text-center cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => fetchFollowList("following")}
                  >
                    <p className="text-xl font-bold text-gray-900">{stats.followingCount}</p>
                    <p className="text-sm text-gray-500 underline">Following</p>
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
              <div key={book._id} className="flex flex-col">
                <BookCard
                  book={book}
                  onDelete={isOwnProfile ? handleDeleteBook : undefined}
                />
                {/* Only show likes if book exists */}
                {/* {book._id && (
                  <div className="flex items-center gap-1 mt-2 px-1">
                    <Heart size={14} fill="#e05c5c" stroke="#e05c5c" />
                    <span className="text-sm text-gray-500 font-medium">
                      {book.likesCount || 0} likes
                    </span>
                  </div>
                )} */}
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
      {/* ── Followers / Following Modal ── */}
      {showFollowModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowFollowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 capitalize">
                {followModalType}
              </h2>
              <button
                onClick={() => setShowFollowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {followModalLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 bg-slate-200 rounded w-32 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-20" />
                    </div>
                  </div>
                ))
              ) : followModalList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No {followModalType} yet
                </div>
              ) : (
                followModalList.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setShowFollowModal(false);
                      navigate(`/profile/${u._id}`);
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-orange-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {u.avatar ? (
                        <img
                          src={u.avatar.startsWith("http") ? u.avatar : `http://localhost:8000${u.avatar}`}
                          alt={u.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {u.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400">
                        @{u.name?.toLowerCase().replace(/\s+/g, "_")}
                      </p>
                    </div>
                    <span className="text-xs text-purple-500 font-medium">View →</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </NewDashboardLayout>
  );
};

export default ProfilePage;