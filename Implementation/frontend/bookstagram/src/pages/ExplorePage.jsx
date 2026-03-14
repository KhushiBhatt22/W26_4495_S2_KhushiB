import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Heart, Search, Filter, X, Eye
} from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";

const GENRES = ["All", "Fantasy", "Romance", "Mystery", "Sci-Fi", "Historical", "Thriller", "Self-Help", "Other"];

// ── Book Grid Card ────────────────────────────────────────────────────────────
const ExploreCard = ({ book, onLike, onRead }) => {
  const [hovered, setHovered] = useState(false);
  const coverUrl = book.coverImage
    ? `${BASE_URL}/backend${book.coverImage}`.replace(/\\/g, "/")
    : null;
  const authorName = book.userId?.name || book.author || "Unknown";

  return (
    <div
      style={{
        ...cardStyles.card,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 32px rgba(217,70,239,0.15)"
          : "0 2px 8px rgba(217,70,239,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div style={cardStyles.coverWrap} onClick={() => onRead(book)}>
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} style={cardStyles.coverImg} />
        ) : (
          <div style={cardStyles.coverPlaceholder}>
            <BookOpen size={36} color="#d946ef" opacity={0.35} />
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          ...cardStyles.hoverOverlay,
          opacity: hovered ? 1 : 0,
        }}>
          <button style={cardStyles.readOverlayBtn} onClick={() => onRead(book)}>
            <Eye size={14} /> Read Book
          </button>
        </div>

        {/* Genre tag */}
        {book.genre && (
          <div style={cardStyles.genreTag}>{book.genre}</div>
        )}
      </div>

      {/* Info */}
      <div style={cardStyles.info}>
        <div style={cardStyles.title}>{book.title}</div>
        <div style={cardStyles.author}>by {authorName}</div>

        {/* Footer */}
        <div style={cardStyles.footer}>
          <button
            style={{
              ...cardStyles.likeBtn,
              color: book.isLiked ? "#e05c5c" : "#9ca3af",
            }}
            onClick={(e) => { e.stopPropagation(); onLike(book._id, book.isLiked); }}
          >
            <Heart
              size={14}
              fill={book.isLiked ? "#e05c5c" : "none"}
              stroke={book.isLiked ? "#e05c5c" : "#9ca3af"}
            />
            {book.likesCount || 0}
          </button>
          <span style={cardStyles.chapters}>
            {book.chapters?.length || 0} chapters
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ExplorePage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchAllBooks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [books, searchQuery, activeGenre]);

  const fetchAllBooks = async () => {
    try {
      // Using existing GET /api/books — swap to /api/books/feed when backend is ready
      const res = await axiosInstance.get(API_PATHS.BOOKS.GET_BOOKS);
      const enriched = (res.data || []).map(b => ({
        ...b,
        isLiked: false,
        likesCount: b.likesCount || Math.floor(Math.random() * 800 + 30),
      }));
      setBooks(enriched);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...books];
    if (activeGenre !== "All") {
      result = result.filter(b =>
        b.genre?.toLowerCase() === activeGenre.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.userId?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
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

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true) } hideTopbar={true}>
      <div style={pageStyles.wrap}>

        {/* ── HEADER ── */}
        <div style={pageStyles.header}>
          <div>
            <h1 style={pageStyles.pageTitle}>Explore Books</h1>
            <p style={pageStyles.pageSubtitle}>Discover stories from all readers on Bookstagram</p>
          </div>
          <div style={pageStyles.bookCount}>
            {filtered.length} {filtered.length === 1 ? "book" : "books"}
          </div>
        </div>

        {/* ── SEARCH + FILTER BAR ── */}
        <div style={pageStyles.filterBar}>
          {/* Search */}
          <div style={pageStyles.searchWrap}>
            <Search size={14} style={pageStyles.searchIcon} />
            <input
              style={pageStyles.searchInput}
              placeholder="Search by title, author, or reader…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X
                size={14}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af" }}
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>

          {/* Genre pills */}
          <div style={pageStyles.genrePills}>
            {GENRES.map(genre => (
              <button
                key={genre}
                style={{
                  ...pageStyles.pill,
                  ...(activeGenre === genre ? pageStyles.pillActive : {}),
                }}
                onClick={() => setActiveGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* ── BOOKS GRID ── */}
        {isLoading ? (
          <div style={pageStyles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={pageStyles.skeletonCard}>
                <div style={pageStyles.skeletonCover} />
                <div style={{ padding: 12 }}>
                  <div style={{ ...pageStyles.skeletonLine, width: "75%", height: 14, marginBottom: 8 }} />
                  <div style={{ ...pageStyles.skeletonLine, width: "50%", height: 11 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={pageStyles.emptyState}>
            <div style={pageStyles.emptyIcon}>🔍</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginTop: 14 }}>
              {searchQuery || activeGenre !== "All" ? "No books match your search" : "No books yet"}
            </p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
              {searchQuery ? `Try a different search term` : "Be the first to create a book!"}
            </p>
            {(searchQuery || activeGenre !== "All") && (
              <button
                style={pageStyles.clearBtn}
                onClick={() => { setSearchQuery(""); setActiveGenre("All"); }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div style={pageStyles.grid}>
            {filtered.map(book => (
              <ExploreCard
                key={book._id}
                book={book}
                onLike={handleLike}
                onRead={handleRead}
              />
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

// ── Styles ────────────────────────────────────────────────────────────────────
const pageStyles = {
topbar: {
  display: "none",
},
  wrap: {
    padding: "28px 32px",
    minHeight: "100%",
    background: "#fdfaff",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },
  bookCount: {
    fontSize: 13,
    fontWeight: 600,
    color: "#d946ef",
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
    border: "1px solid #f3e8ff",
    padding: "6px 14px",
    borderRadius: 20,
  },
  filterBar: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginBottom: 28,
    background: "#fff",
    border: "1px solid #f3e8ff",
    borderRadius: 16,
    padding: "16px 18px",
  },
  searchWrap: {
    position: "relative",
    maxWidth: 420,
  },
  searchIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    background: "#fdfaff",
    border: "1px solid #f3e8ff",
    borderRadius: 24,
    padding: "9px 36px",
    fontSize: 13,
    fontFamily: "inherit",
    color: "#111827",
    outline: "none",
  },
  genrePills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    border: "1.5px solid #f3e8ff",
    background: "#fdfaff",
    color: "#6b7280",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  pillActive: {
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff",
    border: "1.5px solid transparent",
    boxShadow: "0 2px 8px rgba(217,70,239,0.3)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 20,
  },
  skeletonCard: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #f3e8ff",
    overflow: "hidden",
  },
  skeletonCover: {
    width: "100%",
    aspectRatio: "3/4",
    background: "linear-gradient(90deg, #fdf4ff 25%, #f3e8ff 50%, #fdf4ff 75%)",
  },
  skeletonLine: {
    borderRadius: 6,
    background: "linear-gradient(90deg, #fdf4ff 25%, #f3e8ff 50%, #fdf4ff 75%)",
    marginBottom: 4,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "80px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 44,
    width: 80, height: 80,
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #f3e8ff",
  },
  clearBtn: {
    marginTop: 16,
    padding: "9px 22px",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff",
    border: "none",
    borderRadius: 24,
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 14px rgba(217,70,239,0.3)",
  },
};

const cardStyles = {
  card: {
    background: "#fff",
    border: "1px solid #f3e8ff",
    borderRadius: 14,
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  coverWrap: {
    position: "relative",
    width: "100%",
    aspectRatio: "3/4",
    overflow: "hidden",
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
  },
  coverImg: {
    width: "100%", height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s",
  },
  coverPlaceholder: {
    width: "100%", height: "100%",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
  },
  hoverOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(135deg, rgba(217,70,239,0.7), rgba(251,146,60,0.7))",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "opacity 0.2s",
  },
  readOverlayBtn: {
    display: "flex", alignItems: "center", gap: 6,
    background: "#fff",
    color: "#d946ef",
    border: "none",
    borderRadius: 20,
    padding: "8px 16px",
    fontSize: 12, fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  genreTag: {
    position: "absolute",
    top: 10, left: 10,
    background: "rgba(255,255,255,0.92)",
    color: "#d946ef",
    fontSize: 10, fontWeight: 700,
    padding: "3px 8px",
    borderRadius: 20,
    backdropFilter: "blur(4px)",
  },
  info: {
    padding: "12px 14px",
  },
  title: {
    fontSize: 13, fontWeight: 700,
    color: "#111827",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    marginBottom: 3,
  },
  author: {
    fontSize: 11, color: "#9ca3af",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    marginBottom: 10,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  likeBtn: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 12, fontWeight: 500,
    background: "none", border: "none",
    cursor: "pointer", fontFamily: "inherit",
  },
  chapters: {
    fontSize: 11, color: "#9ca3af",
  },
};

export default ExplorePage;
