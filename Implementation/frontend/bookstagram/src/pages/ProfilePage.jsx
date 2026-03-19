import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Heart, BookOpen, Users, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const BASE_URL = "http://localhost:8000";

// Helper to fix avatar URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BASE_URL}${avatar}`;
};

const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const profileId = userId || currentUser?._id;
  const isOwnProfile = profileId === currentUser?._id;

  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleLike = async (bookId, isLiked) => {
    try {
      if (isLiked) {
        const res = await axiosInstance.delete(`${API_PATHS.SOCIAL.UNLIKE}/${bookId}`);
        setBooks((prev) =>
          prev.map((b) => b._id === bookId ? { ...b, isLiked: false, likesCount: res.data.likesCount } : b)
        );
        if (selectedBook?._id === bookId)
          setSelectedBook((p) => ({ ...p, isLiked: false, likesCount: res.data.likesCount }));
      } else {
        const res = await axiosInstance.post(`${API_PATHS.SOCIAL.LIKE}/${bookId}`);
        setBooks((prev) =>
          prev.map((b) => b._id === bookId ? { ...b, isLiked: true, likesCount: res.data.likesCount } : b)
        );
        if (selectedBook?._id === bookId)
          setSelectedBook((p) => ({ ...p, isLiked: true, likesCount: res.data.likesCount }));
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Profile Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg overflow-hidden">
                {profile?.avatar ? (
                  <img
                    src={getAvatarUrl(profile.avatar)}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{profile?.name}</h1>
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                      isFollowing
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

              {/* Email */}
              <p className="text-gray-500 text-sm mb-2">{profile?.email}</p>

              {/* Bio ── shows only if bio exists */}
              {profile?.bio && (
                <p className="text-gray-700 text-sm mb-5 max-w-md">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex justify-center sm:justify-start gap-8 mt-4">
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
        </div>
      </div>

      {/* ── Books Grid ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {books.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No books yet</p>
            <p className="text-gray-400 text-sm">Books will appear here once created</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-3">
            {books.map((book) => (
              <div
                key={book._id}
                className="relative aspect-square cursor-pointer group overflow-hidden rounded-md bg-gray-200"
                onClick={() => setSelectedBook(book)}
              >
                {book.coverImage ? (
                  <img
                    src={`${BASE_URL}${book.coverImage}`}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-primary/50" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  <span className="flex items-center gap-1 text-white font-semibold text-sm">
                    <Heart size={18} fill="white" />
                    {book.likesCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Book Detail Modal ── */}
      {selectedBook && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full flex flex-col sm:flex-row shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Cover */}
            <div className="sm:w-1/2 bg-gray-100 flex items-center justify-center min-h-[280px]">
              {selectedBook.coverImage ? (
                <img
                  src={`${BASE_URL}${selectedBook.coverImage}`}
                  alt={selectedBook.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center min-h-[280px]">
                  <BookOpen className="w-20 h-20 text-primary/40" />
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="sm:w-1/2 p-6 flex flex-col justify-between">
              <div>
                {/* Author */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                    {profile?.avatar ? (
                      <img
                        src={getAvatarUrl(profile.avatar)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {profile?.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{profile?.name}</span>
                </div>

                {/* Book Info */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedBook.title}</h2>
                {selectedBook.subtitle && (
                  <p className="text-gray-500 text-sm mb-3">{selectedBook.subtitle}</p>
                )}
                <p className="text-gray-400 text-xs mb-4">by {selectedBook.author}</p>
                <p className="text-gray-500 text-sm">{selectedBook.chapters?.length || 0} chapters</p>
              </div>

              {/* Like Button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleLike(selectedBook._id, selectedBook.isLiked)}
                  className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors"
                >
                  <Heart
                    size={24}
                    className={selectedBook.isLiked ? "text-red-500 fill-red-500" : "text-gray-400"}
                  />
                  <span className="font-semibold text-sm">{selectedBook.likesCount} likes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;