import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, MessageCircle, BookOpen, MoreHorizontal,
  UserPlus, UserCheck, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import CreateStoryModal from "../components/modals/CreateStoryModal";
import { StoriesStrip, StoryViewer } from "../components/stories/StoriesStrip";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";

// ── Helpers ──────────────────────────────────────────────────────────────────
const coverUrl = (path) =>
  path ? `${BASE_URL}${path.startsWith("/backend") ? "" : ""}${path}` : null;

// ── Book Post Card ────────────────────────────────────────────────────────────
const BookPostCard = ({ book, onLike, onRead, onAuthorClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const author = book.userId || {};
  const authorName = author.name || book.author || "Unknown";
  const authorAvatar = author.avatar || null;
  const imgUrl = coverUrl(book.coverImage);

  return (
    <div style={cardStyles.card}>
      {/* Header */}
      <div style={cardStyles.header}>
        <div
          style={cardStyles.authorAvatar}
          onClick={() => onAuthorClick(author._id)}
        >
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            />
          ) : (
            authorName.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{ ...cardStyles.authorName, cursor: "pointer" }}
            onClick={() => onAuthorClick(author._id)}
          >
            {authorName}
          </div>
          <div style={cardStyles.authorHandle}>
            @{authorName.toLowerCase().replace(/\s+/g, "_")} ·{" "}
            {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : "recently"}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <MoreHorizontal
            size={18}
            color="#9ca3af"
            style={{ cursor: "pointer" }}
            onClick={() => setMenuOpen((v) => !v)}
          />
          {menuOpen && (
            <div style={cardStyles.miniMenu}>
              <div
                style={cardStyles.miniMenuItem}
                onClick={() => { onRead(book); setMenuOpen(false); }}
              >
                📖 Read Book
              </div>
              <div
                style={cardStyles.miniMenuItem}
                onClick={() => { onAuthorClick(author._id); setMenuOpen(false); }}
              >
                👤 View Profile
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cover */}
      <div style={cardStyles.coverWrap} onClick={() => onRead(book)}>
        {imgUrl ? (
          <img src={imgUrl} alt={book.title} style={cardStyles.coverImg} />
        ) : (
          <div style={cardStyles.coverPlaceholder}>
            <BookOpen size={44} color="#d946ef" opacity={0.3} />
          </div>
        )}
        <div style={cardStyles.coverOverlay}>
          <div style={cardStyles.bookTitle}>{book.title}</div>
          {book.subtitle && (
            <div style={cardStyles.bookSubtitle}>{book.subtitle}</div>
          )}
        </div>
        <div
          style={cardStyles.readBtn}
          onClick={(e) => { e.stopPropagation(); onRead(book); }}
        >
          Read Story →
        </div>
      </div>

      {/* Actions */}
      <div style={cardStyles.actions}>
        <button
          style={{
            ...cardStyles.actionBtn,
            color: book.isLiked ? "#e05c5c" : "#9ca3af",
          }}
          onClick={() => onLike(book._id, book.isLiked)}
        >
          <Heart
            size={16}
            fill={book.isLiked ? "#e05c5c" : "none"}
            stroke={book.isLiked ? "#e05c5c" : "#9ca3af"}
          />
          <span>{book.likesCount || 0}</span>
        </button>
        <button style={cardStyles.actionBtn} onClick={() => onRead(book)}>
          <BookOpen size={16} />
          <span>Read Story</span>
        </button>
      </div>
    </div>
  );
};

// ── Suggested User Card ───────────────────────────────────────────────────────
const GRADIENTS = [
  { bg: "135deg, #fdf4ff, #fce7f3", dot: "#d946ef" },
  { bg: "135deg, #fff7ed, #fef3c7", dot: "#fb923c" },
  { bg: "135deg, #ede9fe, #fdf4ff", dot: "#818cf8" },
  { bg: "135deg, #fce7f3, #fff7ed", dot: "#d946ef" },
  { bg: "135deg, #ecfdf5, #f0fdf4", dot: "#10b981" },
  { bg: "135deg, #eff6ff, #eef2ff", dot: "#6366f1" },
];

const SuggestedUserCard = ({ user, isFollowing, onToggle }) => {
  const style = GRADIENTS[user._id?.charCodeAt(0) % GRADIENTS.length] || GRADIENTS[0];
  const name = user.name || "User";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 14px",
      borderRadius: 14,
      background: `linear-gradient(${style.bg})`,
      border: "1px solid #f3e8ff",
      marginBottom: 10,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: "50%",
        background: user.avatar ? "transparent" : `linear-gradient(135deg, ${style.dot}44, ${style.dot}88)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 700, color: style.dot,
        border: `2px solid ${style.dot}44`,
        flexShrink: 0, overflow: "hidden",
      }}>
        {user.avatar
          ? <img src={user.avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : name.charAt(0).toUpperCase()
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{name}</div>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          @{name.toLowerCase().replace(/\s+/g, "_")}
        </div>
        {user.bio && (
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.bio}
          </div>
        )}
      </div>

      <button
        onClick={() => onToggle(user._id, isFollowing)}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 600,
          padding: "6px 12px",
          borderRadius: 20,
          border: isFollowing ? "1.5px solid #e5e7eb" : "none",
          color: isFollowing ? "#9ca3af" : "#fff",
          background: isFollowing ? "transparent" : "linear-gradient(135deg, #d946ef, #fb923c)",
          cursor: "pointer",
          boxShadow: isFollowing ? "none" : "0 2px 8px rgba(217,70,239,0.3)",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
        }}
      >
        {isFollowing
          ? <><UserCheck size={11} /> Following</>
          : <><UserPlus size={11} /> Follow</>
        }
      </button>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const NewDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Feed
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Suggested
  const [suggested, setSuggested] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());

  // Stories
  const [stories, setStories] = useState([]);
  const [isStoriesLoading, setIsStoriesLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(null);
  const [viewedStoryIds, setViewedStoryIds] = useState(new Set());
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ── Fetch feed (books from followed users) ────────────────────────────────
  const fetchFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(API_PATHS.SOCIAL.FEED);
      setBooks(res.data || []);
    } catch {
      toast.error("Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Fetch suggested users ─────────────────────────────────────────────────
  const fetchSuggested = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.SOCIAL.SUGGESTED);
      setSuggested(res.data || []);
    } catch {
      // silent — non-critical
    }
  }, []);

  // ── Fetch all stories (from everyone) ─────────────────────────────────────
  const fetchStories = useCallback(async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.STORIES.GET_STORIES);
      setStories(res.data || []);
    } catch {
      toast.error("Failed to load stories");
    } finally {
      setIsStoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
    fetchSuggested();
    fetchStories();
  }, [fetchFeed, fetchSuggested, fetchStories]);

  // ── Like / Unlike ─────────────────────────────────────────────────────────
  const handleLike = async (bookId, isLiked) => {
    // Optimistic update
    setBooks((prev) =>
      prev.map((b) =>
        b._id === bookId
          ? { ...b, isLiked: !isLiked, likesCount: isLiked ? b.likesCount - 1 : b.likesCount + 1 }
          : b
      )
    );
    try {
      if (isLiked) {
        await axiosInstance.delete(`${API_PATHS.SOCIAL.UNLIKE}/${bookId}`);
      } else {
        await axiosInstance.post(`${API_PATHS.SOCIAL.LIKE}/${bookId}`);
      }
    } catch {
      // Revert on error
      setBooks((prev) =>
        prev.map((b) =>
          b._id === bookId
            ? { ...b, isLiked: isLiked, likesCount: isLiked ? b.likesCount + 1 : b.likesCount - 1 }
            : b
        )
      );
      toast.error("Something went wrong");
    }
  };

  // ── Follow / Unfollow suggested user ──────────────────────────────────────
  const handleToggleFollow = async (userId, isCurrentlyFollowing) => {
    // Optimistic update
    setFollowingIds((prev) => {
      const next = new Set(prev);
      isCurrentlyFollowing ? next.delete(userId) : next.add(userId);
      return next;
    });

    try {
      if (isCurrentlyFollowing) {
        await axiosInstance.delete(`${API_PATHS.SOCIAL.UNFOLLOW}/${userId}`);
        toast.success("Unfollowed");
      } else {
        await axiosInstance.post(`${API_PATHS.SOCIAL.FOLLOW}/${userId}`);
        toast.success("Following!");
        // Refresh feed after following someone new
        fetchFeed();
      }
      // Refresh suggested list
      fetchSuggested();
    } catch (err) {
      // Revert
      setFollowingIds((prev) => {
        const next = new Set(prev);
        isCurrentlyFollowing ? next.add(userId) : next.delete(userId);
        return next;
      });
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleRead = (book) => navigate(`/view-book/${book._id}`);
  const handleAuthorClick = (authorId) => {
    if (authorId) navigate(`/profile/${authorId}`);
  };
  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  // Trending = books sorted by likesCount desc
  const trending = [...books].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0)).slice(0, 4);

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)}>

      {/* ── Stories Strip ── */}
      <StoriesStrip
        stories={stories}
        isLoading={isStoriesLoading}
        user={user}
        onStoryClick={(s) => setActiveStory(s)}
        viewedIds={viewedStoryIds}
        onAddClick={() => setIsStoryModalOpen(true)}
      />

      <div style={pageStyles.wrap}>

        {/* ── CENTER FEED ── */}
        <div style={pageStyles.feed}>
          <div style={pageStyles.feedLabel}>
            <Sparkles size={12} style={{ marginRight: 5, color: "#d946ef" }} />
            Books from people you follow
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={pageStyles.skeleton}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3e8ff" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: "#f3e8ff", borderRadius: 6, width: "40%", marginBottom: 6 }} />
                    <div style={{ height: 10, background: "#fdf4ff", borderRadius: 6, width: "25%" }} />
                  </div>
                </div>
                <div style={{ height: 200, background: "#fdf4ff", borderRadius: 10 }} />
              </div>
            ))
          ) : books.length === 0 ? (
            <div style={pageStyles.emptyState}>
              <div style={pageStyles.emptyIcon}>📚</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginTop: 12 }}>
                Your feed is empty
              </p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                Follow readers to see their books here
              </p>
              <button
                style={pageStyles.exploreBtn}
                onClick={() => navigate("/explore")}
              >
                Explore Books
              </button>
            </div>
          ) : (
            books.map((book) => (
              <BookPostCard
                key={book._id}
                book={book}
                onLike={handleLike}
                onRead={handleRead}
                onAuthorClick={handleAuthorClick}
              />
            ))
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={pageStyles.rightPanel}>

          {/* Suggested People */}
          <div style={{ marginBottom: 24 }}>
            <div style={rightStyles.sectionTitle}>
              <span>People You May Follow</span>
              <span style={rightStyles.seeAll} onClick={() => navigate("/explore")}>
                See all →
              </span>
            </div>

            {suggested.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "16px 0" }}>
                You're following everyone! 🎉
              </p>
            ) : (
              suggested.map((u) => (
                <SuggestedUserCard
                  key={u._id}
                  user={u}
                  isFollowing={followingIds.has(u._id)}
                  onToggle={handleToggleFollow}
                />
              ))
            )}
          </div>

          <div style={{ height: 1, background: "#f3e8ff", margin: "4px 0 20px" }} />

          {/* Trending Books */}
          {trending.length > 0 && (
            <div>
              <div style={rightStyles.sectionTitle}>
                <span>Trending Books</span>
              </div>
              {trending.map((book, i) => (
                <div
                  key={book._id}
                  style={rightStyles.trendingRow}
                  onClick={() => handleRead(book)}
                >
                  <span style={{
                    fontSize: 18, fontWeight: 800,
                    background: "linear-gradient(135deg, #d946ef, #fb923c)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    width: 24, textAlign: "center", flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <div style={rightStyles.trendingThumb}>
                    {book.coverImage
                      ? <img src={coverUrl(book.coverImage)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                      : <BookOpen size={16} color="#d946ef" />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={rightStyles.trendingTitle}>{book.title}</div>
                    <div style={{ fontSize: 11, color: "#fb923c", marginTop: 2 }}>
                      ♥ {book.likesCount || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
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
    </NewDashboardLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const pageStyles = {
  wrap: { display: "flex", minHeight: "100%", background: "#fdfaff" },
  feed: { flex: 1, padding: "24px 28px", minWidth: 0 },
  feedLabel: {
    display: "inline-flex", alignItems: "center",
    fontSize: 11, fontWeight: 600, letterSpacing: "0.5px",
    textTransform: "uppercase", color: "#9ca3af",
    background: "#fff", border: "1px solid #f3e8ff",
    borderRadius: 20, padding: "4px 12px", marginBottom: 18,
  },
  skeleton: {
    background: "#fff", borderRadius: 14,
    padding: 16, marginBottom: 18, border: "1px solid #f3e8ff",
  },
  emptyState: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "60px 20px", textAlign: "center",
  },
  emptyIcon: {
    fontSize: 48, width: 80, height: 80,
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #f3e8ff",
  },
  exploreBtn: {
    marginTop: 16, padding: "10px 24px",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "none", borderRadius: 24,
    fontWeight: 600, fontSize: 13, cursor: "pointer",
    boxShadow: "0 4px 14px rgba(217,70,239,0.3)",
    fontFamily: "inherit",
  },
  rightPanel: {
    width: 320, minWidth: 320,
    padding: "24px 20px",
    borderLeft: "1px solid #f3e8ff",
    background: "#ffffff",
    flexShrink: 0, overflowY: "auto",
  },
};

const cardStyles = {
  card: {
    background: "#ffffff", border: "1px solid #f3e8ff",
    borderRadius: 16, marginBottom: 18, overflow: "hidden",
    boxShadow: "0 1px 8px rgba(217,70,239,0.06)",
  },
  header: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" },
  authorAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: 13,
    flexShrink: 0, overflow: "hidden", cursor: "pointer",
  },
  authorName: { fontSize: 13, fontWeight: 600, color: "#111827" },
  authorHandle: { fontSize: 11, color: "#9ca3af" },
  coverWrap: {
    position: "relative", width: "100%", aspectRatio: "4/3",
    cursor: "pointer", overflow: "hidden", background: "#fdf4ff",
  },
  coverImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  coverPlaceholder: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
  },
  coverOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
    padding: "32px 14px 44px", color: "#fff",
  },
  bookTitle: { fontWeight: 700, fontSize: 16, textShadow: "0 1px 4px rgba(0,0,0,0.3)" },
  bookSubtitle: { fontSize: 11, opacity: 0.8, marginTop: 2 },
  readBtn: {
    position: "absolute", bottom: 10, right: 12,
    background: "rgba(255,255,255,0.95)",
    color: "#111827", fontSize: 11, fontWeight: 600,
    padding: "5px 12px", borderRadius: 20, cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  actions: {
    padding: "10px 14px 12px", display: "flex", gap: 18,
    borderTop: "1px solid #fdf4ff",
  },
  actionBtn: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, color: "#9ca3af",
    background: "none", border: "none", cursor: "pointer",
    fontFamily: "inherit",
  },
  miniMenu: {
    position: "absolute", top: "100%", right: 0,
    background: "#fff", border: "1px solid #f3e8ff",
    borderRadius: 10, boxShadow: "0 4px 16px rgba(217,70,239,0.1)",
    minWidth: 150, zIndex: 50, overflow: "hidden",
  },
  miniMenuItem: { padding: "9px 14px", fontSize: 12, cursor: "pointer", color: "#374151" },
};

const rightStyles = {
  sectionTitle: {
    fontSize: 13, fontWeight: 700, color: "#111827",
    marginBottom: 14,
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  seeAll: { fontSize: 11, color: "#d946ef", fontWeight: 500, cursor: "pointer" },
  trendingRow: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 12, cursor: "pointer", padding: "6px 0",
  },
  trendingThumb: {
    width: 44, height: 44, borderRadius: 10,
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", flexShrink: 0, border: "1px solid #f3e8ff",
  },
  trendingTitle: {
    fontSize: 12, fontWeight: 600, color: "#111827",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
};

export default NewDashboardPage;