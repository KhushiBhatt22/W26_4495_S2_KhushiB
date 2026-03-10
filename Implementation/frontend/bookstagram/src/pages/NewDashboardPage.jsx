import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, BookOpen, MoreHorizontal, UserPlus, UserCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const MOCK_STORIES = [
  { id: 1, name: "Aditi",  color: "#d946ef, #818cf8" },
  { id: 2, name: "Sara",   color: "#fb923c, #d946ef" },
  { id: 3, name: "Roshan", color: "#818cf8, #fb923c" },
  { id: 4, name: "Priya",  color: "#d946ef, #fb923c" },
];

const MOCK_SUGGESTED = [
  { id: 1, name: "Aditi",  handle: "@aditi_reads",  gradient: "135deg, #fdf4ff, #fce7f3", dot: "#d946ef", mutual: 3 },
  { id: 2, name: "Sara",   handle: "@sara_books",   gradient: "135deg, #fff7ed, #fef3c7", dot: "#fb923c", mutual: 1 },
  { id: 3, name: "Roshan", handle: "@roshan_lit",   gradient: "135deg, #ede9fe, #fdf4ff", dot: "#818cf8", mutual: 5 },
  { id: 4, name: "Priya",  handle: "@priya_pages",  gradient: "135deg, #fce7f3, #fff7ed", dot: "#d946ef", mutual: 2 },
];

// ── Story Ring ──────────────────────────────────────────────────────────────
const StoryRing = ({ name, color, isMine }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
    <div style={{
      width: 56, height: 56, borderRadius: "50%",
      background: isMine ? "#f3e8ff" : `linear-gradient(${color})`,
      padding: 2.5,
      boxShadow: isMine ? "none" : "0 2px 10px rgba(217,70,239,0.25)",
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: "50%",
        background: "#fff",
        border: "2px solid #fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: isMine ? 20 : 15, fontWeight: 700,
        color: isMine ? "#d946ef" : "#6b7280",
      }}>
        {isMine ? "+" : name.charAt(0)}
      </div>
    </div>
    <span style={{ fontSize: 11, color: "#9ca3af", maxWidth: 56, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {isMine ? "Your Story" : name}
    </span>
  </div>
);

// ── Book Post Card ──────────────────────────────────────────────────────────
const BookPostCard = ({ book, onLike, onRead }) => {
  const coverUrl = book.coverImage ? `http://localhost:8000${book.coverImage}` : null;
  const authorName = book.userId?.name || "Unknown";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={cardStyles.card}>
      {/* Header */}
      <div style={cardStyles.header}>
        <div style={cardStyles.authorAvatar}>
          {authorName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={cardStyles.authorName}>{authorName}</div>
          <div style={cardStyles.authorHandle}>
            @{authorName.toLowerCase().replace(/\s+/g, "_")} · {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : "recently"}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <MoreHorizontal size={18} color="#9ca3af" style={{ cursor: "pointer" }} onClick={() => setMenuOpen(v => !v)} />
          {menuOpen && (
            <div style={cardStyles.miniMenu}>
              <div style={cardStyles.miniMenuItem} onClick={() => { onRead(book); setMenuOpen(false); }}>📖 Read Book</div>
              <div style={cardStyles.miniMenuItem}>🔖 Save</div>
              <div style={{ ...cardStyles.miniMenuItem, color: "#ef4444" }}>⚑ Report</div>
            </div>
          )}
        </div>
      </div>

      {/* Cover */}
      <div style={cardStyles.coverWrap} onClick={() => onRead(book)}>
        {coverUrl
          ? <img src={coverUrl} alt={book.title} style={cardStyles.coverImg} />
          : (
            <div style={cardStyles.coverPlaceholder}>
              <BookOpen size={44} color="#d946ef" opacity={0.3} />
            </div>
          )
        }
        <div style={cardStyles.coverOverlay}>
          <div style={cardStyles.bookTitle}>{book.title}</div>
          {book.subtitle && <div style={cardStyles.bookSubtitle}>{book.subtitle}</div>}
        </div>
        <div style={cardStyles.readBtn} onClick={(e) => { e.stopPropagation(); onRead(book); }}>
          Read Story →
        </div>
      </div>

      {/* Hashtags */}
      {book.genre && (
        <div style={cardStyles.hashtags}>
          <span style={cardStyles.tag}>#{book.genre.toLowerCase()}</span>
          <span style={cardStyles.tag}>#bookstagram</span>
        </div>
      )}

      {/* Actions */}
      <div style={cardStyles.actions}>
        <button
          style={{ ...cardStyles.actionBtn, color: book.isLiked ? "#e05c5c" : "#9ca3af" }}
          onClick={() => onLike(book._id, book.isLiked)}
        >
          <Heart size={16} fill={book.isLiked ? "#e05c5c" : "none"} stroke={book.isLiked ? "#e05c5c" : "#9ca3af"} />
          <span>{book.likesCount || 0}</span>
        </button>
        <button style={cardStyles.actionBtn}>
          <MessageCircle size={16} />
          <span>Comment</span>
        </button>
        <button style={cardStyles.actionBtn} onClick={() => onRead(book)}>
          <BookOpen size={16} />
          <span>Read Story</span>
        </button>
      </div>
    </div>
  );
};

// ── Suggested User Card ─────────────────────────────────────────────────────
const SuggestedUser = ({ user, isFollowing, onToggle }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 14px",
    borderRadius: 14,
    background: `linear-gradient(${user.gradient})`,
    border: "1px solid #f3e8ff",
    marginBottom: 10,
    transition: "transform 0.15s, box-shadow 0.15s",
  }}>
    {/* Avatar with colored ring */}
    <div style={{
      width: 42, height: 42, borderRadius: "50%",
      background: `linear-gradient(135deg, ${user.dot}44, ${user.dot}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, fontWeight: 700, color: user.dot,
      border: `2px solid ${user.dot}44`,
      flexShrink: 0,
    }}>
      {user.name.charAt(0)}
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{user.name}</div>
      <div style={{ fontSize: 11, color: "#9ca3af" }}>{user.handle}</div>
      {user.mutual > 0 && (
        <div style={{ fontSize: 10, color: user.dot, marginTop: 2, fontWeight: 500 }}>
          👥 {user.mutual} mutual readers
        </div>
      )}
    </div>

    <button
      onClick={() => onToggle(user.id)}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        fontSize: 11, fontWeight: 600,
        padding: "6px 12px",
        borderRadius: 20,
        border: isFollowing ? "1.5px solid #e5e7eb" : "none",
        color: isFollowing ? "#9ca3af" : "#fff",
        background: isFollowing ? "transparent" : `linear-gradient(135deg, #d946ef, #fb923c)`,
        cursor: "pointer",
        boxShadow: isFollowing ? "none" : "0 2px 8px rgba(217,70,239,0.3)",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
      }}
    >
      {isFollowing ? <><UserCheck size={11} /> Following</> : <><UserPlus size={11} /> Follow</>}
    </button>
  </div>
);

// ── Main Page ───────────────────────────────────────────────────────────────
const NewDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([3]);

  useEffect(() => { fetchFeedBooks(); }, []);

  const fetchFeedBooks = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.BOOKS.GET_BOOKS);
      const enriched = (res.data || []).map(b => ({
        ...b,
        isLiked: false,
        likesCount: b.likesCount || Math.floor(Math.random() * 900 + 50),
      }));
      setBooks(enriched);
    } catch {
      toast.error("Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (bookId, isLiked) => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`${API_PATHS.SOCIAL.UNLIKE}/${bookId}`);
      } else {
        await axiosInstance.post(`${API_PATHS.SOCIAL.LIKE}/${bookId}`);
      }
      setBooks(prev => prev.map(b => b._id === bookId
        ? { ...b, isLiked: !isLiked, likesCount: isLiked ? b.likesCount - 1 : b.likesCount + 1 }
        : b
      ));
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleRead = (book) => navigate(`/editor/${book._id}`);

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  const toggleFollow = (id) =>
    setFollowedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)}>
      <div style={pageStyles.wrap}>

        {/* ── CENTER FEED ── */}
        <div style={pageStyles.feed}>

          {/* Stories */}
          <div style={pageStyles.storiesWrap}>
            <StoryRing name="You" color="135deg, #d946ef, #fb923c" isMine />
            {MOCK_STORIES.map(s => <StoryRing key={s.id} name={s.name} color={s.color} />)}
          </div>

          {/* Feed label */}
          <div style={pageStyles.feedLabel}>
            <Sparkles size={12} style={{ marginRight: 5, color: "#d946ef" }} />
            Books from people you follow
          </div>

          {/* Posts */}
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={pageStyles.skeleton}>
                <div style={{ height: 14, width: 160, background: "#f3e8ff", borderRadius: 6, marginBottom: 10 }} />
                <div style={{ height: 200, background: "#fdf4ff", borderRadius: 10 }} />
              </div>
            ))
          ) : books.length === 0 ? (
            <div style={pageStyles.emptyState}>
              <div style={pageStyles.emptyIcon}>📚</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginTop: 12 }}>Your feed is empty</p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Follow readers to see their books here</p>
              <button
                style={pageStyles.exploreBtn}
                onClick={() => navigate("/explore")}
              >
                Explore Books
              </button>
            </div>
          ) : (
            books.map(book => (
              <BookPostCard key={book._id} book={book} onLike={handleLike} onRead={handleRead} />
            ))
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={pageStyles.rightPanel}>

          {/* Suggested People */}
          <div style={{ marginBottom: 24 }}>
            <div style={rightStyles.sectionTitle}>
              <span>✨ People You May Follow</span>
              <span style={rightStyles.seeAll} onClick={() => navigate("/explore")}>See all →</span>
            </div>
            {MOCK_SUGGESTED.map(u => (
              <SuggestedUser
                key={u.id}
                user={u}
                isFollowing={followedUsers.includes(u.id)}
                onToggle={toggleFollow}
              />
            ))}
          </div>

          <div style={{ height: 1, background: "#f3e8ff", margin: "4px 0 20px" }} />

          {/* Trending Books */}
          <div>
            <div style={rightStyles.sectionTitle}>
              <span>🔥 Trending Books</span>
            </div>
            {books.slice(0, 4).map((book, i) => (
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
                    ? <img src={`http://localhost:8000${book.coverImage}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    : <BookOpen size={16} color="#d946ef" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={rightStyles.trendingTitle}>{book.title}</div>
                  <div style={{ fontSize: 11, color: "#fb923c", marginTop: 2 }}>♥ {book.likesCount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateBookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookCreated={handleBookCreated}
      />
    </NewDashboardLayout>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const pageStyles = {
  wrap: {
    display: "flex",
    minHeight: "100%",
    background: "#fdfaff",
  },
  feed: {
    flex: 1,
    padding: "24px 28px",
    //maxWidth: 600,
    minWidth: 0,
  },
  storiesWrap: {
    display: "flex",
    gap: 16,
    marginBottom: 22,
    overflowX: "auto",
    paddingBottom: 4,
  },
  feedLabel: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    color: "#9ca3af",
    background: "#fff",
    border: "1px solid #f3e8ff",
    borderRadius: 20,
    padding: "4px 12px",
    marginBottom: 18,
  },
  skeleton: {
    background: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    border: "1px solid #f3e8ff",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 48,
    width: 80, height: 80,
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #f3e8ff",
  },
  exploreBtn: {
    marginTop: 16,
    padding: "10px 24px",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff",
    border: "none",
    borderRadius: 24,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(217,70,239,0.3)",
    fontFamily: "inherit",
  },
  rightPanel: {
    width: 320,
    minWidth: 320,
    padding: "24px 20px",
    borderLeft: "1px solid #f3e8ff",
    background: "#ffffff",
    flexShrink: 0,
    overflowY: "auto",
  },
};

const cardStyles = {
  card: {
    background: "#ffffff",
    border: "1px solid #f3e8ff",
    borderRadius: 16,
    marginBottom: 18,
    overflow: "hidden",
    boxShadow: "0 1px 8px rgba(217,70,239,0.06)",
  },
  header: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 14px",
  },
  authorAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  authorName: { fontSize: 13, fontWeight: 600, color: "#111827" },
  authorHandle: { fontSize: 11, color: "#9ca3af" },
  coverWrap: {
    position: "relative", width: "100%", aspectRatio: "4/3",
    cursor: "pointer", overflow: "hidden", background: "#fdf4ff",
  },
  coverImg: {
    width: "100%", height: "100%", objectFit: "cover", display: "block",
  },
  coverPlaceholder: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
  },
  coverOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
    padding: "32px 14px 44px",
    color: "#fff",
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
  hashtags: { padding: "8px 14px 4px", display: "flex", gap: 8, flexWrap: "wrap" },
  tag: {
    fontSize: 12, fontWeight: 500,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
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
    minWidth: 140, zIndex: 50, overflow: "hidden",
  },
  miniMenuItem: {
    padding: "9px 14px", fontSize: 12, cursor: "pointer", color: "#374151",
  },
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
    overflow: "hidden", flexShrink: 0,
    border: "1px solid #f3e8ff",
  },
  trendingTitle: {
    fontSize: 12, fontWeight: 600, color: "#111827",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
};

export default NewDashboardPage;
