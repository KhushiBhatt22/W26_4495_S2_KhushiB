import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Book, X, Clock, Camera, BookOpen, Heart } from "lucide-react";

import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import BookCard from "../components/cards/BookCard";
import CreateBookModal from "../components/modals/CreateBookModal";
import CreateStoryModal from "../components/modals/CreateStoryModal";

// ─── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hours ago`;
};

const STYLE_GRADIENTS = {
  cartoon:    "from-pink-500 via-fuchsia-500 to-purple-600",
  sketch:     "from-slate-400 via-zinc-500 to-gray-600",
  storyboard: "from-amber-400 via-orange-500 to-red-500",
  colorful:   "from-cyan-400 via-teal-400 to-emerald-500",
};

const AVATAR_COLORS = [
  "bg-rose-400", "bg-fuchsia-500", "bg-violet-500",
  "bg-blue-500",  "bg-teal-500",   "bg-amber-500",
];

const avatarColor = (name = "") => {
  const code = [...(name || "A")].reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const initials = (name = "") =>
  name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

// ─── Skeletons ───────────────────────────────────────────────────────────────
const BookCardSkeleton = () => (
  <div className="animate-pulse bg-white border border-slate-200 rounded-lg shadow-sm">
    <div className="w-full aspect-[16/25] bg-slate-200 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  </div>
);

const StoryBubbleSkeleton = () => (
  <div className="flex flex-col items-center gap-2 flex-shrink-0 animate-pulse">
    <div className="w-[62px] h-[62px] rounded-full bg-slate-200" />
    <div className="h-2.5 w-12 rounded bg-slate-200" />
  </div>
);

// ─── Story Components ────────────────────────────────────────────────────────
const StoryBubble = ({ story, isViewed, onClick }) => {
  const gradient = STYLE_GRADIENTS[story.style] || STYLE_GRADIENTS.cartoon;
  const name = story.user?.name || "User";
  const color = avatarColor(name);

  return (
    <button
      onClick={() => onClick(story)}
      className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
    >
      <div className={`p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 ${isViewed ? "bg-slate-300" : `bg-gradient-to-tr ${gradient}`}`}>
        <div className="p-[2.5px] bg-white rounded-full">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100">
            {story.imageUrl ? (
              <img src={story.imageUrl} alt={story.prompt} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${color}`}>
                <span className="text-white text-sm font-bold">{initials(name)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="text-[11px] text-slate-600 font-medium w-16 text-center truncate leading-tight">
        {name.split(" ")[0]}
      </span>
    </button>
  );
};

const AddStoryBubble = ({ user, onClick }) => {
  const color = avatarColor(user?.name || "");
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none">
      <div className="relative">
        <div className="w-[62px] h-[62px] rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 group-hover:border-slate-300 transition-colors">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${color}`}>
              <span className="text-white font-bold text-base">{initials(user?.name)}</span>
            </div>
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <Plus className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </div>
      </div>
      <span className="text-[11px] text-slate-600 font-medium">Your Story</span>
    </button>
  );
};

const StoriesStrip = ({ stories, isLoading, user, onStoryClick, viewedIds, onAddClick }) => {
  const scrollRef = useRef(null);
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div ref={scrollRef} className="flex items-start gap-5 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <AddStoryBubble user={user} onClick={onAddClick} />
          <div className="w-px self-stretch bg-slate-100 flex-shrink-0 my-0.5" />
          {isLoading ? (
            Array.from({ length: 7 }).map((_, i) => <StoryBubbleSkeleton key={i} />)
          ) : stories.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm self-center py-2">
              <Camera className="w-4 h-4 flex-shrink-0" />
              <span>No stories yet</span>
            </div>
          ) : (
            stories.map((story) => (
              <StoryBubble key={story._id} story={story} isViewed={viewedIds.has(story._id)} onClick={onStoryClick} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StoryViewer = ({ story, stories, onClose, onViewed }) => {
  const [index, setIndex] = useState(stories.findIndex((s) => s._id === story._id));
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const DURATION = 5000;
  const current = stories[index];

  useEffect(() => { if (current) onViewed(current._id); }, [index]);

  useEffect(() => {
    setProgress(0);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { handleNext(); return 0; }
        return p + (100 / (DURATION / 100));
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [index]);

  const handleNext = () => { if (index < stories.length - 1) setIndex((i) => i + 1); else onClose(); };
  const handlePrev = () => { if (index > 0) setIndex((i) => i - 1); };

  if (!current) return null;
  const name = current.user?.name || "User";
  const color = avatarColor(name);
  const gradient = STYLE_GRADIENTS[current.style] || STYLE_GRADIENTS.cartoon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={onClose}>
      {index > 0 && (
        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-2xl transition-colors z-20">‹</button>
      )}
      <div className="relative w-[360px] rounded-2xl overflow-hidden shadow-2xl bg-black" style={{ aspectRatio: "9/16", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-3 inset-x-3 z-20 flex gap-1">
          {stories.map((s, i) => (
            <div key={s._id} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }} />
            </div>
          ))}
        </div>
        <div className="absolute top-8 inset-x-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-[2px] rounded-full bg-gradient-to-tr ${gradient}`}>
              <div className="p-[1.5px] bg-black rounded-full">
                <div className={`w-8 h-8 rounded-full overflow-hidden ${color} flex items-center justify-center`}>
                  {current.user?.avatar ? <img src={current.user.avatar} className="w-full h-full object-cover" alt={name} /> : <span className="text-white text-xs font-bold">{initials(name)}</span>}
                </div>
              </div>
            </div>
            <div>
              <p className="text-white text-xs font-semibold leading-none">{name.split(" ")[0]}</p>
              <p className="text-white/50 text-[10px] flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5" />{timeAgo(current.createdAt)} ago</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"><X className="w-4 h-4 text-white" /></button>
        </div>
        <img src={current.imageUrl} alt={current.prompt} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pt-12 pb-5">
          <p className="text-white text-sm leading-relaxed line-clamp-3">{current.prompt}</p>
        </div>
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>
      </div>
      {index < stories.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-2xl transition-colors z-20">›</button>
      )}
    </div>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
          <p className="text-slate-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} className="bg-red-600 text-white hover:bg-red-700">Confirm</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard Page ─────────────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profile state
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ postsCount: 0, followersCount: 0, followingCount: 0 });
  const [selectedBook, setSelectedBook] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Dashboard state
  const [books, setBooks] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoriesLoading, setIsStoriesLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [viewedStoryIds, setViewedStoryIds] = useState(new Set());
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // ── Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`${API_PATHS.SOCIAL.GET_USER_PROFILE}/${user?._id}`);
        setProfile(res.data.user);
        setStats({
          postsCount: res.data.postsCount,
          followersCount: res.data.followersCount,
          followingCount: res.data.followingCount,
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    };
    if (user?._id) fetchProfile();
  }, [user]);

  // ── Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.BOOKS.GET_BOOKS);
        setBooks(response.data);
      } catch {
        toast.error("Failed to fetch your eBooks.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooks();
  }, []);

  // ── Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axiosInstance.get(`${API_PATHS.STORIES.GET_STORIES}/user/${user?._id}`);
        setStories(res.data);
      } catch {
        toast.error("Failed to load your Stories.");
      } finally {
        setIsStoriesLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      await axiosInstance.delete(`${API_PATHS.BOOKS.DELETE_BOOK}/${bookToDelete}`);
      setBooks(books.filter((book) => book._id !== bookToDelete));
      toast.success("eBook deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete eBook.");
    } finally {
      setBookToDelete(null);
    }
  };

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  const handleLike = async (bookId, isLiked) => {
    try {
      if (isLiked) {
        const res = await axiosInstance.delete(`${API_PATHS.SOCIAL.UNLIKE}/${bookId}`);
        setBooks((prev) => prev.map((b) => b._id === bookId ? { ...b, isLiked: false, likesCount: res.data.likesCount } : b));
        if (selectedBook?._id === bookId) setSelectedBook((p) => ({ ...p, isLiked: false, likesCount: res.data.likesCount }));
      } else {
        const res = await axiosInstance.post(`${API_PATHS.SOCIAL.LIKE}/${bookId}`);
        setBooks((prev) => prev.map((b) => b._id === bookId ? { ...b, isLiked: true, likesCount: res.data.likesCount } : b));
        if (selectedBook?._id === bookId) setSelectedBook((p) => ({ ...p, isLiked: true, likesCount: res.data.likesCount }));
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    // ✅ Now using NewDashboardLayout — passes onCreateBook to trigger the Create modal
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)}>

      {/* ── 1. Profile Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {profileLoading ? (
            <div className="flex items-center gap-8 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-slate-200 rounded w-40" />
                <div className="h-4 bg-slate-200 rounded w-56" />
                <div className="flex gap-8 mt-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 w-16 bg-slate-200 rounded" />)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">{profile?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile?.name}</h1>
                <p className="text-gray-500 text-sm mb-5">{profile?.email}</p>

                {/* Stats */}
                <div className="flex justify-center sm:justify-start gap-8">
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

      {/* ── 2. Stories Strip ── */}
      <StoriesStrip
        stories={stories}
        isLoading={isStoriesLoading}
        user={user}
        onStoryClick={(s) => setActiveStory(s)}
        viewedIds={viewedStoryIds}
        onAddClick={() => setIsStoryModalOpen(true)}
      />

      {/* ── 3. Books Section ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-bold text-slate-900">All eBooks</h1>
            <p className="text-[13px] text-slate-600 mt-1">Create, edit, and manage all your AI-generated eBooks.</p>
          </div>
          <Button className="whitespace-nowrap" onClick={() => setIsCreateModalOpen(true)} icon={Plus}>
            Create New eBook
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Book className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No eBooks Found</h3>
            <p className="text-slate-500 mb-6 max-w-md">You haven't created any eBooks yet. Get started by creating your first one.</p>
            <Button onClick={() => setIsCreateModalOpen(true)} icon={Plus}>Create Your First eBook</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} onDelete={() => setBookToDelete(book._id)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <ConfirmationModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={handleDeleteBook}
        title="Delete eBook"
        message="Are you sure you want to delete this eBook? This action cannot be undone."
      />

      <CreateBookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookCreated={handleBookCreated}
      />

      <CreateStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {activeStory && (
        <StoryViewer
          story={activeStory}
          stories={stories}
          onClose={() => setActiveStory(null)}
          onViewed={(id) => setViewedStoryIds((prev) => new Set([...prev, id]))}
        />
      )}

      {/* ── Book Detail Modal ── */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBook(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full flex flex-col sm:flex-row shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sm:w-1/2 bg-gray-100 flex items-center justify-center min-h-[280px]">
              {selectedBook.coverImage ? (
                <img src={`http://localhost:8000${selectedBook.coverImage}`} alt={selectedBook.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center min-h-[280px]">
                  <BookOpen className="w-20 h-20 text-primary/40" />
                </div>
              )}
            </div>
            <div className="sm:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                    {profile?.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-white text-sm font-bold">{profile?.name?.charAt(0)}</span>}
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{profile?.name}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedBook.title}</h2>
                {selectedBook.subtitle && <p className="text-gray-500 text-sm mb-3">{selectedBook.subtitle}</p>}
                <p className="text-gray-400 text-xs mb-4">by {selectedBook.author}</p>
                <p className="text-gray-500 text-sm">{selectedBook.chapters?.length || 0} chapters</p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => handleLike(selectedBook._id, selectedBook.isLiked)} className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors">
                  <Heart size={24} className={selectedBook.isLiked ? "text-red-500 fill-red-500" : "text-gray-400"} />
                  <span className="font-semibold text-sm">{selectedBook.likesCount} likes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </NewDashboardLayout>
  );
};

export default DashboardPage;
