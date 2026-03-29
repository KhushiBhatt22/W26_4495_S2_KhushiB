import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Heart, Eye } from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import SurveyModal from "../components/modals/SurveyModal";

const buildCoverUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const clean = path.replace(/\\/g, "/");
  if (clean.startsWith("/backend")) return `${BASE_URL}${clean}`;
  return `${BASE_URL}/backend${clean}`;
};

// ── Card ──────────────────────────────────────────────────────────────────────
const ExploreCard = ({ book, onLike, onRead, onAuthorClick }) => {
  const [hovered, setHovered] = useState(false);
  const imgUrl = buildCoverUrl(book.coverImage);
  const authorName = book.userId?.name || book.author || "Unknown";
  const authorAvatar = book.userId?.avatar || null;

  return (
    <div
      style={{
        ...cardStyles.card,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 32px rgba(217,70,239,0.15)" : "0 2px 8px rgba(217,70,239,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={cardStyles.coverWrap} onClick={() => onRead(book)}>
        {imgUrl
          ? <img src={imgUrl} alt={book.title} style={cardStyles.coverImg} />
          : <div style={cardStyles.coverPlaceholder}><BookOpen size={36} color="#d946ef" opacity={0.35} /></div>
        }
        <div style={{ ...cardStyles.hoverOverlay, opacity: hovered ? 1 : 0 }}>
          <button style={cardStyles.readOverlayBtn}><Eye size={14} /> Read Book</button>
        </div>
      </div>

      <div style={cardStyles.info}>
        <div style={cardStyles.title}>{book.title}</div>
        <div style={cardStyles.authorRow} onClick={() => onAuthorClick(book.userId?._id)}>
          <div style={cardStyles.authorAvatar}>
            {authorAvatar
              ? <img src={authorAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : authorName.charAt(0).toUpperCase()
            }
          </div>
          <span style={cardStyles.authorName}>{authorName}</span>
        </div>
        <div style={cardStyles.footer}>
          <button
            style={{ ...cardStyles.likeBtn, color: book.isLiked ? "#e05c5c" : "#9ca3af" }}
            onClick={(e) => { e.stopPropagation(); onLike(book._id, book.isLiked); }}
          >
            <Heart size={14} fill={book.isLiked ? "#e05c5c" : "none"} stroke={book.isLiked ? "#e05c5c" : "#9ca3af"} />
            {book.likesCount || 0}
          </button>
          <span style={cardStyles.chapters}>{book.chapters?.length || 0} ch.</span>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ExplorePage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => { fetchAllBooks(); }, []);

  const fetchAllBooks = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.BOOKS.GET_ALL_PUBLIC);
      setBooks(res.data || []);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (bookId, isLiked) => {
    setBooks(prev => prev.map(b => b._id === bookId
      ? { ...b, isLiked: !isLiked, likesCount: isLiked ? b.likesCount - 1 : b.likesCount + 1 }
      : b
    ));
    try {
      if (isLiked) await axiosInstance.delete(`${API_PATHS.SOCIAL.UNLIKE}/${bookId}`);
      else await axiosInstance.post(`${API_PATHS.SOCIAL.LIKE}/${bookId}`);
    } catch {
      setBooks(prev => prev.map(b => b._id === bookId
        ? { ...b, isLiked, likesCount: isLiked ? b.likesCount + 1 : b.likesCount - 1 }
        : b
      ));
      toast.error("Something went wrong");
    }
  };

  const handleRead = (book) => navigate(`/view-book/${book._id}`);
  const handleAuthorClick = (authorId) => { if (authorId) navigate(`/profile/${authorId}`); };
  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    setSurveyBookId(bookId);
    navigate(`/editor/${bookId}`);
  };

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)} hideTopbar={true}>
      <div style={pageStyles.wrap}>

        <div style={pageStyles.header}>
          <div>
            <h1 style={pageStyles.pageTitle}>Explore Books</h1>
            <p style={pageStyles.pageSubtitle}>Discover stories from all readers on Bookstagram</p>
          </div>
          <div style={pageStyles.bookCount}>{books.length} {books.length === 1 ? "book" : "books"}</div>
        </div>

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
        ) : books.length === 0 ? (
          <div style={pageStyles.emptyState}>
            <div style={pageStyles.emptyIcon}>📚</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginTop: 14 }}>No books yet</p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Be the first to create a book!</p>
          </div>
        ) : (
          <div style={pageStyles.grid}>
            {books.map(book => (
              <ExploreCard key={book._id} book={book} onLike={handleLike} onRead={handleRead} onAuthorClick={handleAuthorClick} />
            ))}
          </div>
        )}
      </div>

      <CreateBookModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onBookCreated={handleBookCreated} />
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
    </NewDashboardLayout>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const pageStyles = {
  wrap: { padding: "28px 32px", minHeight: "100%", background: "#fdfaff" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#9ca3af", marginTop: 4 },
  bookCount: { fontSize: 13, fontWeight: 600, color: "#d946ef", background: "linear-gradient(135deg, #fdf4ff, #fff7ed)", border: "1px solid #f3e8ff", padding: "6px 14px", borderRadius: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 },
  skeletonCard: { background: "#fff", borderRadius: 14, border: "1px solid #f3e8ff", overflow: "hidden" },
  skeletonCover: { width: "100%", aspectRatio: "3/4", background: "linear-gradient(90deg, #fdf4ff 25%, #f3e8ff 50%, #fdf4ff 75%)" },
  skeletonLine: { borderRadius: 6, background: "linear-gradient(90deg, #fdf4ff 25%, #f3e8ff 50%, #fdf4ff 75%)", marginBottom: 4 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px", textAlign: "center" },
  emptyIcon: { fontSize: 44, width: 80, height: 80, background: "linear-gradient(135deg, #fdf4ff, #fff7ed)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #f3e8ff" },
};

const cardStyles = {
  card: { background: "#fff", border: "1px solid #f3e8ff", borderRadius: 14, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" },
  coverWrap: { position: "relative", width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "linear-gradient(135deg, #fdf4ff, #fff7ed)" },
  coverImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  coverPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  hoverOverlay: { position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(217,70,239,0.7), rgba(251,146,60,0.7))", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.2s" },
  readOverlayBtn: { display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#d946ef", border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  info: { padding: "12px 14px" },
  title: { fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 6 },
  authorRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 10, cursor: "pointer" },
  authorAvatar: { width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #d946ef, #fb923c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700, overflow: "hidden" },
  authorName: { fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  likeBtn: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" },
  chapters: { fontSize: 11, color: "#9ca3af" },
};

export default ExplorePage;