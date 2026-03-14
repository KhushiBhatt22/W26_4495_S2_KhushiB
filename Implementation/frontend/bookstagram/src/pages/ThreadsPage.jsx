import { useState, useEffect, useRef } from "react";
import {
  Heart, MessageCircle, MoreHorizontal, Image,
  X, Send, BookOpen, Sparkles, Plus
} from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

// ── Mock threads data (replace with real API when thread backend is ready) ──
const INITIAL_THREADS = [
  {
    id: 1,
    author: { name: "Aditi", handle: "@aditi_reads", avatar: null, color: "#d946ef" },
    text: "Just finished 'The Midnight Library' and I'm not okay 😭📚 Some books don't just change your mood — they change your perspective on every choice you've ever made. Matt Haig is a genius. #BookReview #MidnightLibrary",
    image: "https://picsum.photos/seed/library1/600/350",
    likes: 234, liked: false,
    comments: [
      { author: "Sara", text: "Read it three times already! 💙" },
      { author: "Roshan", text: "The multiverse concept hit different" },
    ],
    postedAt: "2h ago",
  },
  {
    id: 2,
    author: { name: "Roshan", handle: "@roshan_lit", avatar: null, color: "#818cf8" },
    text: "Hot take: Brandon Sanderson writes better magic systems than any other fantasy author alive today. The Stormlight Archive's mechanics are genuinely mind-bending. Change my mind 👇 #Fantasy #Sanderson",
    image: null,
    likes: 456, liked: false,
    comments: [
      { author: "Aditi", text: "Hard agree!! 🔥" },
    ],
    postedAt: "5h ago",
  },
  {
    id: 3,
    author: { name: "Sara", handle: "@sara_books", avatar: null, color: "#fb923c" },
    text: "My reading nook setup this season 🍂✨ A good book, warm tea, and the rain outside — nothing better in the world. Currently reading 'Rebecca' by Daphne du Maurier for the fifth time. #ReadingNook #BookLovers",
    image: "https://picsum.photos/seed/nook22/600/350",
    likes: 789, liked: false,
    comments: [
      { author: "Priya", text: "So cozy!! 😍" },
      { author: "Khushi", text: "Rebecca is timeless 🖤" },
    ],
    postedAt: "1d ago",
  },
  {
    id: 4,
    author: { name: "Priya", handle: "@priya_pages", avatar: null, color: "#10b981" },
    text: "Writing my second book and honestly the second book is SO much harder than the first. The 'sophomore slump' is real. Any authors here have tips for pushing through the middle section? #WritingCommunity #AuthorLife",
    image: null,
    likes: 312, liked: false,
    comments: [
      { author: "Roshan", text: "Outline everything first!" },
      { author: "Sara", text: "Write the ending first, then fill in 🙌" },
    ],
    postedAt: "1d ago",
  },
];

// ── Thread Card ───────────────────────────────────────────────────────────────
const ThreadCard = ({ thread, onLike, onDelete, isOwn }) => {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLong = thread.text.length > 200;

  return (
    <div style={cardStyles.card}>
      {/* Header */}
      <div style={cardStyles.header}>
        <div style={{ ...cardStyles.avatar, background: `linear-gradient(135deg, ${thread.author.color}44, ${thread.author.color}88)`, color: thread.author.color }}>
          {thread.author.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={cardStyles.authorName}>{thread.author.name}</div>
          <div style={cardStyles.authorMeta}>{thread.author.handle} · {thread.postedAt}</div>
        </div>
        <div style={{ position: "relative" }}>
          <MoreHorizontal size={18} color="#9ca3af" style={{ cursor: "pointer" }} onClick={() => setMenuOpen(v => !v)} />
          {menuOpen && (
            <div style={cardStyles.menu}>
              <div style={cardStyles.menuItem}>🔖 Save Thread</div>
              {isOwn && (
                <div style={{ ...cardStyles.menuItem, color: "#ef4444" }} onClick={() => { onDelete(thread.id); setMenuOpen(false); }}>
                  🗑️ Delete
                </div>
              )}
              <div style={cardStyles.menuItem}>⚑ Report</div>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div style={cardStyles.textWrap}>
        <p style={cardStyles.text}>
          {isLong && !expanded ? thread.text.slice(0, 200) + "…" : thread.text}
        </p>
        {isLong && (
          <span style={cardStyles.readMore} onClick={() => setExpanded(v => !v)}>
            {expanded ? "Show less" : "Read more"}
          </span>
        )}
      </div>

      {/* Image */}
      {thread.image && (
        <div style={cardStyles.imageWrap}>
          <img src={thread.image} alt="thread" style={cardStyles.image}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}

      {/* Hashtags */}
      <div style={cardStyles.hashtags}>
        {thread.text.match(/#\w+/g)?.map((tag, i) => (
          <span key={i} style={cardStyles.tag}>{tag}</span>
        ))}
      </div>

      {/* Actions */}
      <div style={cardStyles.actions}>
        <button
          style={{ ...cardStyles.actionBtn, color: thread.liked ? "#e05c5c" : "#9ca3af" }}
          onClick={() => onLike(thread.id)}
        >
          <Heart size={16} fill={thread.liked ? "#e05c5c" : "none"} stroke={thread.liked ? "#e05c5c" : "#9ca3af"} />
          <span>{thread.likes}</span>
        </button>
        <button style={cardStyles.actionBtn} onClick={() => setShowComments(v => !v)}>
          <MessageCircle size={16} />
          <span>{thread.comments.length} Comments</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && thread.comments.length > 0 && (
        <div style={cardStyles.commentsWrap}>
          {thread.comments.map((c, i) => (
            <div key={i} style={cardStyles.commentRow}>
              <div style={{ ...cardStyles.commentAvatar }}>{c.author.charAt(0)}</div>
              <div style={cardStyles.commentBubble}>
                <span style={cardStyles.commentAuthor}>{c.author}</span>
                <span style={cardStyles.commentText}>{c.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Create Thread Panel ───────────────────────────────────────────────────────
const CreateThreadPanel = ({ user, onPost }) => {
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const maxChars = 500;

  const handlePost = () => {
    if (!text.trim()) { toast.error("Write something first!"); return; }
    onPost({ text, image: imageUrl });
    setText("");
    setImageUrl("");
    setShowImageInput(false);
  };

  return (
    <div style={createStyles.panel}>
      <div style={createStyles.header}>
        <div style={createStyles.avatar}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <textarea
          style={createStyles.textarea}
          placeholder="Share your reading thoughts, book reviews, or short stories…"
          value={text}
          onChange={e => setText(e.target.value.slice(0, maxChars))}
          rows={3}
        />
      </div>

      {/* Image preview */}
      {showImageInput && (
        <div style={createStyles.imageRow}>
          <Image size={14} color="#d946ef" />
          <input
            style={createStyles.imageInput}
            placeholder="Paste image URL…"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          <X size={14} color="#9ca3af" style={{ cursor: "pointer" }} onClick={() => { setShowImageInput(false); setImageUrl(""); }} />
        </div>
      )}

      {imageUrl && (
        <img src={imageUrl} alt="preview" style={createStyles.imagePreview}
          onError={e => e.target.style.display = "none"} />
      )}

      <div style={createStyles.footer}>
        <div style={createStyles.footerLeft}>
          <button style={createStyles.iconBtn} onClick={() => setShowImageInput(v => !v)} title="Add image">
            <Image size={16} color="#d946ef" />
          </button>
          <span style={createStyles.charCount}>
            <span style={{ color: text.length > maxChars * 0.8 ? "#fb923c" : "#9ca3af" }}>
              {text.length}
            </span>/{maxChars}
          </span>
        </div>
        <button
          style={{
            ...createStyles.postBtn,
            opacity: text.trim() ? 1 : 0.5,
            cursor: text.trim() ? "pointer" : "not-allowed",
          }}
          onClick={handlePost}
          disabled={!text.trim()}
        >
          <Send size={14} /> Post Thread
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ThreadsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLike = (id) => {
    setThreads(prev => prev.map(t =>
      t.id === id
        ? { ...t, liked: !t.liked, likes: t.liked ? t.likes - 1 : t.likes + 1 }
        : t
    ));
  };

  const handleDelete = (id) => {
    setThreads(prev => prev.filter(t => t.id !== id));
    toast.success("Thread deleted");
  };

  const handlePost = ({ text, image }) => {
    const newThread = {
      id: Date.now(),
      author: {
        name: user?.name || "You",
        handle: `@${user?.name?.toLowerCase().replace(/\s+/g, "_") || "you"}`,
        avatar: null,
        color: "#d946ef",
      },
      text,
      image: image || null,
      likes: 0,
      liked: false,
      comments: [],
      postedAt: "Just now",
    };
    setThreads(prev => [newThread, ...prev]);
    toast.success("Thread posted! 🎉");
  };

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)}>
      <div style={pageStyles.wrap}>

        {/* ── LEFT: FEED ── */}
        <div style={pageStyles.feed}>
          <div style={pageStyles.feedHeader}>
            <h1 style={pageStyles.pageTitle}>Threads</h1>
            <p style={pageStyles.pageSubtitle}>Short stories, reviews & reading moments</p>
          </div>

          {/* Create box */}
          <CreateThreadPanel user={user} onPost={handlePost} />

          {/* Thread list */}
          <div style={{ marginTop: 20 }}>
            {threads.map(thread => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                onLike={handleLike}
                onDelete={handleDelete}
                isOwn={thread.author.name === user?.name}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR ── */}
        <div style={pageStyles.rightPanel}>

          {/* Tips */}
          <div style={rightStyles.section}>
            <div style={rightStyles.title}>✍️ Thread Tips</div>
            {[
              { icon: "📖", tip: "Share book reviews under 500 characters" },
              { icon: "🖼️", tip: "Add images to make your thread stand out" },
              { icon: "#️⃣", tip: "Use hashtags like #BookReview #Fantasy" },
              { icon: "💬", tip: "Ask questions to spark discussions" },
            ].map((t, i) => (
              <div key={i} style={rightStyles.tipRow}>
                <span style={rightStyles.tipIcon}>{t.icon}</span>
                <span style={rightStyles.tipText}>{t.tip}</span>
              </div>
            ))}
          </div>

          <div style={rightStyles.divider} />

          {/* Trending tags */}
          <div style={rightStyles.section}>
            <div style={rightStyles.title}>🔥 Trending Tags</div>
            {[
              { tag: "#BookReview", count: "2.4k threads" },
              { tag: "#Fantasy", count: "1.8k threads" },
              { tag: "#ReadingNook", count: "987 threads" },
              { tag: "#AuthorLife", count: "743 threads" },
              { tag: "#Bookstagram", count: "3.1k threads" },
            ].map((t, i) => (
              <div key={i} style={rightStyles.tagRow}>
                <div>
                  <div style={rightStyles.tagName}>{t.tag}</div>
                  <div style={rightStyles.tagCount}>{t.count}</div>
                </div>
                <div style={rightStyles.tagRank}>#{i + 1}</div>
              </div>
            ))}
          </div>

          <div style={rightStyles.divider} />

          {/* Active readers */}
          <div style={rightStyles.section}>
            <div style={rightStyles.title}>🌟 Active Readers</div>
            {[
              { name: "Aditi", handle: "@aditi_reads", threads: 12, color: "#d946ef" },
              { name: "Roshan", handle: "@roshan_lit", threads: 8, color: "#818cf8" },
              { name: "Sara", handle: "@sara_books", threads: 15, color: "#fb923c" },
            ].map((r, i) => (
              <div key={i} style={rightStyles.readerRow}>
                <div style={{ ...rightStyles.readerAvatar, background: `${r.color}22`, color: r.color }}>
                  {r.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={rightStyles.readerName}>{r.name}</div>
                  <div style={rightStyles.readerHandle}>{r.handle}</div>
                </div>
                <div style={rightStyles.readerThreads}>{r.threads} threads</div>
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

// ── Styles ────────────────────────────────────────────────────────────────────
const pageStyles = {
  wrap: {
    display: "flex",
    minHeight: "100%",
    background: "#fdfaff",
  },
  feed: {
    flex: 1,
    padding: "28px 28px",
    maxWidth: 640,
    minWidth: 0,
  },
  feedHeader: { marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#9ca3af", marginTop: 4 },
  rightPanel: {
    width: 300,
    padding: "28px 20px",
    borderLeft: "1px solid #f3e8ff",
    background: "#ffffff",
    flexShrink: 0,
    overflowY: "auto",
  },
};

const createStyles = {
  panel: {
    background: "#fff",
    border: "1px solid #f3e8ff",
    borderRadius: 16,
    padding: "16px",
    boxShadow: "0 2px 12px rgba(217,70,239,0.07)",
  },
  header: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  avatar: {
    width: 38, height: 38, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  textarea: {
    flex: 1,
    border: "none",
    outline: "none",
    resize: "none",
    fontSize: 14,
    fontFamily: "inherit",
    color: "#111827",
    background: "transparent",
    lineHeight: 1.6,
  },
  imageRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    padding: "8px 12px",
    background: "#fdf4ff",
    borderRadius: 10,
    border: "1px solid #f3e8ff",
  },
  imageInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 12,
    fontFamily: "inherit",
    background: "transparent",
    color: "#374151",
  },
  imagePreview: {
    width: "100%",
    borderRadius: 10,
    marginTop: 10,
    maxHeight: 200,
    objectFit: "cover",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #f3e8ff",
  },
  footerLeft: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 32, height: 32, borderRadius: "50%",
    background: "#fdf4ff", border: "1px solid #f3e8ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  charCount: { fontSize: 11, color: "#9ca3af" },
  postBtn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 18px",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "none", borderRadius: 20,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 3px 10px rgba(217,70,239,0.3)",
  },
};

const cardStyles = {
  card: {
    background: "#fff",
    border: "1px solid #f3e8ff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    boxShadow: "0 1px 6px rgba(217,70,239,0.05)",
  },
  header: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "14px 16px 10px",
  },
  avatar: {
    width: 38, height: 38, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  authorName: { fontSize: 13, fontWeight: 600, color: "#111827" },
  authorMeta: { fontSize: 11, color: "#9ca3af" },
  menu: {
    position: "absolute", top: "100%", right: 0,
    background: "#fff", border: "1px solid #f3e8ff",
    borderRadius: 10, boxShadow: "0 4px 16px rgba(217,70,239,0.1)",
    minWidth: 150, zIndex: 50, overflow: "hidden",
  },
  menuItem: {
    padding: "9px 14px", fontSize: 12, cursor: "pointer", color: "#374151",
  },
  textWrap: { padding: "0 16px 10px" },
  text: { fontSize: 14, color: "#374151", lineHeight: 1.65, margin: 0 },
  readMore: {
    fontSize: 12, color: "#d946ef", fontWeight: 600,
    cursor: "pointer", display: "block", marginTop: 4,
  },
  imageWrap: {
    width: "100%", overflow: "hidden",
    maxHeight: 320,
  },
  image: {
    width: "100%", objectFit: "cover", display: "block",
  },
  hashtags: {
    padding: "8px 16px 4px",
    display: "flex", gap: 6, flexWrap: "wrap",
  },
  tag: {
    fontSize: 12, fontWeight: 500,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  actions: {
    padding: "10px 16px 12px",
    display: "flex", gap: 20,
    borderTop: "1px solid #fdf4ff",
  },
  actionBtn: {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 12, color: "#9ca3af",
    background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
  },
  commentsWrap: {
    padding: "10px 16px 14px",
    borderTop: "1px solid #fdf4ff",
    display: "flex", flexDirection: "column", gap: 10,
    background: "#fdfaff",
  },
  commentRow: { display: "flex", gap: 8, alignItems: "flex-start" },
  commentAvatar: {
    width: 26, height: 26, borderRadius: "50%",
    background: "linear-gradient(135deg, #fdf4ff, #f3e8ff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, color: "#d946ef", flexShrink: 0,
  },
  commentBubble: {
    background: "#fff",
    border: "1px solid #f3e8ff",
    borderRadius: 10,
    padding: "6px 10px",
    flex: 1,
  },
  commentAuthor: { fontSize: 11, fontWeight: 700, color: "#111827", marginRight: 6 },
  commentText: { fontSize: 12, color: "#4b5563" },
};

const rightStyles = {
  section: { marginBottom: 20 },
  title: { fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 },
  divider: { height: 1, background: "#f3e8ff", margin: "4px 0 20px" },
  tipRow: {
    display: "flex", gap: 10, alignItems: "flex-start",
    marginBottom: 10,
    padding: "8px 10px",
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
    borderRadius: 10,
    border: "1px solid #f3e8ff",
  },
  tipIcon: { fontSize: 14, flexShrink: 0 },
  tipText: { fontSize: 12, color: "#4b5563", lineHeight: 1.5 },
  tagRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "9px 0",
    borderBottom: "1px solid #fdf4ff",
    cursor: "pointer",
  },
  tagName: { fontSize: 13, fontWeight: 600, color: "#d946ef" },
  tagCount: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  tagRank: { fontSize: 13, fontWeight: 700, color: "#f3e8ff" },
  readerRow: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 12,
  },
  readerAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  readerName: { fontSize: 13, fontWeight: 600, color: "#111827" },
  readerHandle: { fontSize: 11, color: "#9ca3af" },
  readerThreads: { fontSize: 11, color: "#d946ef", fontWeight: 600, whiteSpace: "nowrap" },
};

export default ThreadsPage;
