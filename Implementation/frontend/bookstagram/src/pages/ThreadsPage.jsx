import { useState, useEffect, useRef } from "react";
import {
  Heart, MessageCircle, MoreHorizontal,
  X, Send, Image, Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import { useNavigate } from "react-router-dom";

const MAX_IMAGES = 5;
const MAX_CHARS = 500;

// ── Helpers ───────────────────────────────────────────────────────────────────
const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BASE_URL}${avatar}`;
};

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  if (img.startsWith("/backend")) return `${BASE_URL}${img}`;
  return `${BASE_URL}/backend${img}`;
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ── Thread Card ───────────────────────────────────────────────────────────────
const ThreadCard = ({ thread, currentUser, onLike, onDelete, onComment, onDeleteComment }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullImage, setFullImage] = useState(null); // ← full image modal

  const authorName = thread.user?.name || "Unknown";
  const authorAvatar = thread.user?.avatar;
  const isOwn = thread.user?._id === currentUser?._id;
  const isLiked = thread.likes?.includes(currentUser?._id);
  const isLong = thread.text?.length > 200;
  const images = thread.images || [];

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(thread._id, commentText);
    setCommentText("");
    setShowComments(true);
  };

  return (
    <div style={cardStyles.card}>

      {/* Full Image Modal */}
      {fullImage && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setFullImage(null)}
        >
          <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
            <img
              src={fullImage}
              alt="full"
              style={{
                width: "90vw", height: "90vw",
                maxWidth: 600, maxHeight: 600,
                objectFit: "cover", borderRadius: 16,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            />
            <button
              style={{
                position: "absolute", top: -14, right: -14,
                width: 36, height: 36, borderRadius: "50%",
                background: "#fff", border: "none",
                fontSize: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                fontWeight: 700, color: "#374151",
              }}
              onClick={() => setFullImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={cardStyles.header}>
        <div style={cardStyles.avatarWrap}>
          {authorAvatar ? (
            <img src={getAvatarUrl(authorAvatar)} alt={authorName}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              onError={e => e.target.style.display = "none"} />
          ) : (
            <span style={{ color: "#fff", fontWeight: 700 }}>{authorName.charAt(0)}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={cardStyles.authorName}>{authorName}</div>
          <div style={cardStyles.authorMeta}>
            @{authorName.toLowerCase().replace(/\s+/g, "_")} · {timeAgo(thread.createdAt)}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <MoreHorizontal size={18} color="#9ca3af" style={{ cursor: "pointer" }}
            onClick={() => setMenuOpen(v => !v)} />
          {menuOpen && (
            <div style={cardStyles.menu}>
              <div style={cardStyles.menuItem}
                onClick={() => { navigate(`/profile/${thread.user?._id}`); setMenuOpen(false); }}>
                View Profile
              </div>
              {isOwn && (
                <div style={{ ...cardStyles.menuItem, color: "#ef4444" }}
                  onClick={() => { onDelete(thread._id); setMenuOpen(false); }}>
                  Delete
                </div>
              )}
              <div style={cardStyles.menuItem} onClick={() => setMenuOpen(false)}>
                Report
              </div>
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

      {/* Images — Instagram carousel */}
      {images.length > 0 && (
        <div style={cardStyles.imageWrap}>
          <img
            src={getImageUrl(images[currentImageIndex])}
            alt="thread"
            style={{ ...cardStyles.image, cursor: "zoom-in" }}
            onClick={() => setFullImage(getImageUrl(images[currentImageIndex]))}
            onError={e => e.target.style.display = "none"}
          />
          {images.length > 1 && (
            <div style={cardStyles.imageCounter}>
              {currentImageIndex + 1}/{images.length}
            </div>
          )}
          {images.length > 1 && currentImageIndex > 0 && (
            <button style={{ ...cardStyles.imageArrow, left: 10 }}
              onClick={() => setCurrentImageIndex(i => i - 1)}>‹</button>
          )}
          {images.length > 1 && currentImageIndex < images.length - 1 && (
            <button style={{ ...cardStyles.imageArrow, right: 10 }}
              onClick={() => setCurrentImageIndex(i => i + 1)}>›</button>
          )}
          {images.length > 1 && (
            <div style={cardStyles.imageDots}>
              {images.map((_, i) => (
                <div key={i} style={{
                  ...cardStyles.dot,
                  background: i === currentImageIndex ? "#d946ef" : "rgba(255,255,255,0.5)",
                }} onClick={() => setCurrentImageIndex(i)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hashtags */}
      <div style={cardStyles.hashtags}>
        {thread.text?.match(/#\w+/g)?.map((tag, i) => (
          <span key={i} style={cardStyles.tag}>{tag}</span>
        ))}
      </div>

      {/* Actions */}
      <div style={cardStyles.actions}>
        <button
          style={{ ...cardStyles.actionBtn, color: isLiked ? "#e05c5c" : "#9ca3af" }}
          onClick={() => onLike(thread._id)}
        >
          <Heart size={16} fill={isLiked ? "#e05c5c" : "none"}
            stroke={isLiked ? "#e05c5c" : "#9ca3af"} />
          <span>{thread.likes?.length || 0}</span>
        </button>
        <button style={cardStyles.actionBtn}
          onClick={() => { setShowCommentInput(v => !v); setShowComments(true); }}>
          <MessageCircle size={16} />
          <span>{thread.comments?.length || 0} Comments</span>
        </button>
      </div>

      {/* Comment input */}
      {showCommentInput && (
        <div style={cardStyles.commentInputWrap}>
          <input
            style={cardStyles.commentInput}
            placeholder="Write a comment…"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleComment()}
          />
          <button style={cardStyles.commentSendBtn} onClick={handleComment}>
            <Send size={13} color="#fff" />
          </button>
        </div>
      )}

      {/* Comments list */}
      {showComments && thread.comments?.length > 0 && (
        <div style={cardStyles.commentsWrap}>
          {thread.comments.map((c, i) => (
            <div key={i} style={{ ...cardStyles.commentRow, position: "relative" }}
              className="comment-row-hover">
              <div style={cardStyles.commentAvatar}>
                {c.user?.avatar ? (
                  <img src={getAvatarUrl(c.user.avatar)} alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#d946ef" }}>
                    {c.user?.name?.charAt(0) || "?"}
                  </span>
                )}
              </div>
              <div style={{ ...cardStyles.commentBubble, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <span style={cardStyles.commentAuthor}>{c.user?.name || "User"}</span>
                  <span style={cardStyles.commentText}>{c.text}</span>
                </div>
                {/* Delete button — only own comments */}
                {c.user?._id === currentUser?._id && (
                  <button
                    onClick={() => onDeleteComment(thread._id, c._id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#ef4444", fontSize: 14, padding: "2px 4px",
                      borderRadius: 6, flexShrink: 0,
                      opacity: 0.6,
                    }}
                    title="Delete comment"
                  >
                     <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Create Thread Panel ───────────────────────────────────────────────────────
const CreateThreadPanel = ({ user, onPost, isPosting }) => {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, MAX_IMAGES);
    setSelectedFiles(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handlePost = () => {
    if (!text.trim()) { toast.error("Write something first!"); return; }
    onPost({ text, files: selectedFiles });
    setText("");
    setSelectedFiles([]);
    setPreviews([]);
  };

  return (
    <div style={createStyles.panel}>
      <div style={createStyles.header}>
        <div style={createStyles.avatar}>
          {user?.avatar ? (
            <img src={getAvatarUrl(user.avatar)} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
          ) : (
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        <textarea
          style={createStyles.textarea}
          placeholder="Share your reading thoughts, book reviews, or short stories…"
          value={text}
          onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
          rows={3}
        />
      </div>

      {previews.length > 0 && (
        <div style={createStyles.previewGrid}>
          {previews.map((url, i) => (
            <div key={i} style={createStyles.previewItem}>
              <img src={url} alt="" style={createStyles.previewImg} />
              <button style={createStyles.removeBtn} onClick={() => removeImage(i)}>
                <X size={12} color="#fff" />
              </button>
            </div>
          ))}
          {previews.length < MAX_IMAGES && (
            <div style={createStyles.addMoreBtn} onClick={() => fileInputRef.current?.click()}>
              <span style={{ fontSize: 24, color: "#d946ef" }}>+</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Add more</span>
            </div>
          )}
        </div>
      )}

      <div style={createStyles.footer}>
        <div style={createStyles.footerLeft}>
          <button style={createStyles.iconBtn}
            onClick={() => fileInputRef.current?.click()}
            title={`Add up to ${MAX_IMAGES} images`}>
            <Image size={16} color="#d946ef" />
          </button>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {previews.length > 0 && `${previews.length}/${MAX_IMAGES} · `}
            <span style={{ color: text.length > MAX_CHARS * 0.8 ? "#fb923c" : "#9ca3af" }}>
              {text.length}
            </span>/{MAX_CHARS}
          </span>
        </div>
        <button
          style={{
            ...createStyles.postBtn,
            opacity: text.trim() && !isPosting ? 1 : 0.5,
            cursor: text.trim() && !isPosting ? "pointer" : "not-allowed",
          }}
          onClick={handlePost}
          disabled={!text.trim() || isPosting}
        >
          <Send size={14} /> {isPosting ? "Posting…" : "Post Thread"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        multiple
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ThreadsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => { fetchThreads(); }, []);

  const fetchThreads = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.THREADS.GET_THREADS);
      setThreads(res.data || []);
    } catch {
      toast.error("Failed to load threads");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePost = async ({ text, files }) => {
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      files.forEach(f => formData.append("images", f));
      const res = await axiosInstance.post(API_PATHS.THREADS.CREATE_THREAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setThreads(prev => [res.data, ...prev]);
      toast.success("Thread posted! 🎉");
    } catch {
      toast.error("Failed to post thread");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (threadId) => {
    try {
      await axiosInstance.put(`${API_PATHS.THREADS.LIKE_THREAD}/${threadId}/like`);
      setThreads(prev => prev.map(t => {
        if (t._id !== threadId) return t;
        const liked = t.likes?.includes(user._id);
        return {
          ...t,
          likes: liked
            ? t.likes.filter(id => id !== user._id)
            : [...(t.likes || []), user._id],
        };
      }));
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (threadId) => {
    try {
      await axiosInstance.delete(`${API_PATHS.THREADS.DELETE_THREAD}/${threadId}`);
      setThreads(prev => prev.filter(t => t._id !== threadId));
      toast.success("Thread deleted");
    } catch {
      toast.error("Failed to delete thread");
    }
  };

  const handleComment = async (threadId, text) => {
    try {
      const res = await axiosInstance.post(
        `${API_PATHS.THREADS.ADD_COMMENT}/${threadId}/comment`,
        { text }
      );
      setThreads(prev => prev.map(t => t._id === threadId ? res.data : t));
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  const handleDeleteComment = async (threadId, commentId) => {
    try {
      const res = await axiosInstance.delete(
        `${API_PATHS.THREADS.GET_THREADS}/${threadId}/comment/${commentId}`
      );
      setThreads(prev => prev.map(t => t._id === threadId ? res.data : t));
      toast.success("Comment deleted!");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)} hideTopbar={true}>
      <div style={pageStyles.wrap}>

        {/* ── LEFT: FEED ── */}
        <div style={pageStyles.feed}>
          <div style={pageStyles.feedHeader}>
            <h1 style={pageStyles.pageTitle}>Threads</h1>
            <p style={pageStyles.pageSubtitle}>Short stories, reviews & reading moments</p>
          </div>

          <CreateThreadPanel user={user} onPost={handlePost} isPosting={isPosting} />

          <div style={{ marginTop: 20 }}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, border: "1px solid #f3e8ff" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#f3e8ff" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 12, background: "#f3e8ff", borderRadius: 6, width: "40%", marginBottom: 6 }} />
                      <div style={{ height: 10, background: "#fdf4ff", borderRadius: 6, width: "25%" }} />
                    </div>
                  </div>
                  <div style={{ height: 60, background: "#fdf4ff", borderRadius: 8 }} />
                </div>
              ))
            ) : threads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48 }}>📝</div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginTop: 12 }}>No threads yet</p>
                <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Be the first to post a thread!</p>
              </div>
            ) : (
              threads.map(thread => (
                <ThreadCard
                  key={thread._id}
                  thread={thread}
                  currentUser={user}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onComment={handleComment}
                  onDeleteComment={handleDeleteComment}
                />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: SIDEBAR ── */}
        <div style={pageStyles.rightPanel}>

          {/* Thread Tips */}
          <div style={rightStyles.section}>
            <div style={rightStyles.title}>✍️ Thread Tips</div>
            {[
              { icon: "📖", tip: "Share book reviews under 500 characters" },
              { icon: "🖼️", tip: "Upload up to 5 images per thread" },
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

          {/* Trending Tags */}
          <div style={rightStyles.section}>
            <div style={rightStyles.title}>🔥 Trending Tags</div>
            {[
              { tag: "#BookReview", count: "2.4k" },
              { tag: "#Fantasy", count: "1.8k" },
              { tag: "#ReadingNook", count: "987" },
              { tag: "#AuthorLife", count: "743" },
              { tag: "#Bookstagram", count: "3.1k" },
            ].map((t, i) => (
              <div key={i} style={rightStyles.tagRow}>
                <div>
                  <div style={rightStyles.tagName}>{t.tag}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.count} threads</div>
                </div>
                <div style={rightStyles.tagRank}>#{i + 1}</div>
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
  wrap: { display: "flex", minHeight: "100%", background: "#fdfaff" },
  feed: { flex: 1, padding: "28px 32px", minWidth: 0 },
  feedHeader: { marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#9ca3af", marginTop: 4 },
  rightPanel: {
    width: 340, minWidth: 340, padding: "28px 24px",
    borderLeft: "1px solid #f3e8ff",
    background: "#ffffff", flexShrink: 0, overflowY: "auto",
  },
};

const createStyles = {
  panel: {
    background: "#fff", border: "1px solid #f3e8ff",
    borderRadius: 16, padding: 16,
    boxShadow: "0 2px 12px rgba(217,70,239,0.07)",
  },
  header: { display: "flex", gap: 12, alignItems: "flex-start" },
  avatar: {
    width: 38, height: 38, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: "hidden",
  },
  textarea: {
    flex: 1, border: "none", outline: "none", resize: "none",
    fontSize: 14, fontFamily: "inherit", color: "#111827",
    background: "transparent", lineHeight: 1.6,
  },
  previewGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, padding: "8px 0" },
  previewItem: {
    position: "relative", width: 80, height: 80,
    borderRadius: 10, overflow: "hidden", border: "2px solid #f3e8ff",
  },
  previewImg: { width: "100%", height: "100%", objectFit: "cover" },
  removeBtn: {
    position: "absolute", top: 4, right: 4,
    width: 20, height: 20, borderRadius: "50%",
    background: "rgba(0,0,0,0.6)", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  addMoreBtn: {
    width: 80, height: 80, borderRadius: 10,
    border: "2px dashed #f3e8ff",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    cursor: "pointer", background: "#fdfaff", gap: 2,
  },
  footer: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3e8ff",
  },
  footerLeft: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 32, height: 32, borderRadius: "50%",
    background: "#fdf4ff", border: "1px solid #f3e8ff",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  postBtn: {
    display: "flex", alignItems: "center", gap: 6, padding: "8px 18px",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "none", borderRadius: 20,
    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 3px 10px rgba(217,70,239,0.3)",
  },
};

const cardStyles = {
  card: {
    background: "#fff", border: "1px solid #f3e8ff",
    borderRadius: 16, marginBottom: 16, overflow: "hidden",
    boxShadow: "0 1px 6px rgba(217,70,239,0.05)",
  },
  header: { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 10px" },
  avatarWrap: {
    width: 38, height: 38, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: "hidden", color: "#fff",
  },
  authorName: { fontSize: 13, fontWeight: 600, color: "#111827" },
  authorMeta: { fontSize: 11, color: "#9ca3af" },
  menu: {
    position: "absolute", top: "100%", right: 0,
    background: "#fff", border: "1px solid #f3e8ff",
    borderRadius: 10, boxShadow: "0 4px 16px rgba(217,70,239,0.1)",
    minWidth: 150, zIndex: 50, overflow: "hidden",
  },
  menuItem: { padding: "9px 14px", fontSize: 12, cursor: "pointer", color: "#374151" },
  textWrap: { padding: "0 16px 10px" },
  text: { fontSize: 14, color: "#374151", lineHeight: 1.65, margin: 0 },
  readMore: { fontSize: 12, color: "#d946ef", fontWeight: 600, cursor: "pointer", display: "block", marginTop: 4 },
  imageWrap: { position: "relative", width: "100%", maxHeight: 400, overflow: "hidden" },
  image: { width: "100%", maxHeight: 400, objectFit: "cover", display: "block" },
  imageCounter: {
    position: "absolute", top: 10, right: 10,
    background: "rgba(0,0,0,0.5)", color: "#fff",
    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
  },
  imageArrow: {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.4)", color: "#fff",
    border: "none", borderRadius: "50%",
    width: 30, height: 30, fontSize: 20,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  imageDots: {
    position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
    display: "flex", gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: "50%", cursor: "pointer" },
  hashtags: { padding: "8px 16px 4px", display: "flex", gap: 6, flexWrap: "wrap" },
  tag: {
    fontSize: 12, fontWeight: 500,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  actions: { padding: "10px 16px 12px", display: "flex", gap: 20, borderTop: "1px solid #fdf4ff" },
  actionBtn: {
    display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9ca3af",
    background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
  },
  commentInputWrap: { display: "flex", gap: 8, padding: "8px 16px", borderTop: "1px solid #fdf4ff" },
  commentInput: {
    flex: 1, border: "1px solid #f3e8ff", borderRadius: 20,
    padding: "7px 14px", fontSize: 12, fontFamily: "inherit",
    color: "#111827", background: "#fdfaff", outline: "none",
  },
  commentSendBtn: {
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    border: "none", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
  },
  commentsWrap: {
    padding: "10px 16px 14px", borderTop: "1px solid #fdf4ff",
    display: "flex", flexDirection: "column", gap: 10, background: "#fdfaff",
  },
  commentRow: { display: "flex", gap: 8, alignItems: "flex-start" },
  commentAvatar: {
    width: 26, height: 26, borderRadius: "50%",
    background: "linear-gradient(135deg, #fdf4ff, #f3e8ff)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, color: "#d946ef", flexShrink: 0, overflow: "hidden",
  },
  commentBubble: {
    background: "#fff", border: "1px solid #f3e8ff",
    borderRadius: 10, padding: "6px 10px", flex: 1,
  },
  commentAuthor: { fontSize: 11, fontWeight: 700, color: "#111827", marginRight: 6 },
  commentText: { fontSize: 12, color: "#4b5563" },
};

const rightStyles = {
  section: { marginBottom: 24 },
  title: {
    fontSize: 11, fontWeight: 700, color: "#6b7280",
    marginBottom: 14, paddingBottom: 8,
    borderBottom: "2px solid #f3e8ff",
    textTransform: "uppercase", letterSpacing: "1px",
  },
  divider: { height: 1, background: "#f3e8ff", margin: "4px 0 24px" },
  tipRow: {
    display: "flex", gap: 10, alignItems: "flex-start",
    padding: "10px 0", borderBottom: "1px solid #f9fafb",
  },
  tipIcon: { fontSize: 14, flexShrink: 0 },
  tipText: { fontSize: 12, color: "#4b5563", lineHeight: 1.5 },
  tagRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 0", borderBottom: "1px solid #f9fafb", cursor: "pointer",
  },
  tagName: { fontSize: 13, fontWeight: 600, color: "#d946ef" },
  tagRank: { fontSize: 12, fontWeight: 700, color: "#e5e7eb" },
};

export default ThreadsPage;
