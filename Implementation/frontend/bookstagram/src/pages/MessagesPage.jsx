import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send, Bot, UserPlus, UserCheck, Search,
  MessageCircle, Sparkles, X, BookOpen, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

// ── Mock Data (replace with real API) ─────────────────────────────────────────
const MOCK_USERS = [
  { id: "1", name: "Aditi",  handle: "@aditi_reads",  color: "#d946ef", lastMsg: "Have you read The Name of the Wind? 📖", time: "10:32 AM", unread: 2 },
  { id: "2", name: "Sara",   handle: "@sara_books",   color: "#fb923c", lastMsg: "Your last book review was amazing! 💙",   time: "Yesterday", unread: 0 },
  { id: "3", name: "Roshan", handle: "@roshan_lit",   color: "#818cf8", lastMsg: "Dragon's Realm was incredible btw 🐉",    time: "2d ago",    unread: 1 },
  { id: "4", name: "Priya",  handle: "@priya_pages",  color: "#10b981", lastMsg: "Let's do a book swap sometime!",          time: "3d ago",    unread: 0 },
];

const MOCK_MESSAGES = {
  "1": [
    { from: "them", text: "Hey! Have you read The Name of the Wind? 📖", time: "10:30 AM" },
    { from: "me",   text: "Yes!! It's one of my all-time favorites 🌟",  time: "10:31 AM" },
    { from: "them", text: "Right?! Kvothe is such a complex character",  time: "10:32 AM" },
  ],
  "2": [
    { from: "them", text: "Your last book review was amazing! 💙", time: "Yesterday" },
    { from: "me",   text: "Thank you so much Sara! Means a lot 🥰", time: "Yesterday" },
  ],
  "3": [
    { from: "me",   text: "Dragon's Realm was incredible btw 🐉",    time: "2d ago" },
    { from: "them", text: "Thank you!! Working on the sequel 🔥",     time: "2d ago" },
    { from: "them", text: "Dragon's Realm was incredible btw 🐉",    time: "2d ago" },
  ],
  "4": [
    { from: "them", text: "Let's do a book swap sometime!", time: "3d ago" },
  ],
};

// Follow requests mock
const MOCK_REQUESTS = [
  { id: "5", name: "Meera",  handle: "@meera_reads",  color: "#f59e0b" },
  { id: "6", name: "Arjun",  handle: "@arjun_writes", color: "#06b6d4" },
];

// Chatbot responses
const BOT_RESPONSES = [
  (q) => q.toLowerCase().includes("recommend") || q.toLowerCase().includes("book")
    ? "📚 Based on your reading history, I'd recommend **The Stormlight Archive** by Brandon Sanderson or **The Night Circus** by Erin Morgenstern! Both are fantastic."
    : null,
  (q) => q.toLowerCase().includes("hello") || q.toLowerCase().includes("hi")
    ? "👋 Hey there! I'm your Bookstagram assistant. Ask me for book recommendations, reading tips, or help with your profile!"
    : null,
  (q) => q.toLowerCase().includes("genre") || q.toLowerCase().includes("fantasy")
    ? "🐉 Fantasy is amazing! Top picks: **Mistborn**, **Name of the Wind**, **A Court of Thorns and Roses**, and **The Way of Kings**."
    : null,
  (q) => q.toLowerCase().includes("romance")
    ? "💕 For romance: **The Hating Game**, **Beach Read**, **It Ends with Us**, and **The Kiss Quotient** are all wonderful!"
    : null,
  (q) => q.toLowerCase().includes("tip") || q.toLowerCase().includes("write")
    ? "✍️ Writing tip: Start with a strong opening line, write your ending first, and don't edit while you draft. Just keep writing!"
    : null,
  () => "🤔 Interesting question! I'm still learning. Try asking me for book recommendations or writing tips — that's where I shine! 📖",
];

const getBotReply = (question) => {
  for (const fn of BOT_RESPONSES) {
    const reply = fn(question);
    if (reply) return reply;
  }
  return BOT_RESPONSES[BOT_RESPONSES.length - 1]();
};

// ── Components ─────────────────────────────────────────────────────────────────

const UserListItem = ({ user, active, onClick }) => (
  <div
    style={{
      ...listStyles.item,
      background: active ? "linear-gradient(135deg, #fdf4ff, #fff7ed)" : "transparent",
      borderLeft: active ? `3px solid #d946ef` : "3px solid transparent",
    }}
    onClick={onClick}
  >
    <div style={{ ...listStyles.avatar, background: `${user.color}22`, color: user.color }}>
      {user.name.charAt(0)}
    </div>
    <div style={listStyles.info}>
      <div style={listStyles.name}>{user.name}</div>
      <div style={listStyles.lastMsg}>{user.lastMsg}</div>
    </div>
    <div style={listStyles.meta}>
      <div style={listStyles.time}>{user.time}</div>
      {user.unread > 0 && <div style={listStyles.unread}>{user.unread}</div>}
    </div>
  </div>
);

const ChatBubble = ({ msg }) => (
  <div style={{
    display: "flex",
    justifyContent: msg.from === "me" ? "flex-end" : "flex-start",
    marginBottom: 10,
  }}>
    <div style={{
      maxWidth: "68%",
      padding: "10px 14px",
      borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      background: msg.from === "me"
        ? "linear-gradient(135deg, #d946ef, #fb923c)"
        : msg.from === "bot"
        ? "linear-gradient(135deg, #fdf4ff, #ede9fe)"
        : "#f3f4f6",
      color: msg.from === "me" ? "#fff" : "#111827",
      fontSize: 13,
      lineHeight: 1.55,
      boxShadow: msg.from === "me"
        ? "0 2px 10px rgba(217,70,239,0.25)"
        : "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {msg.from === "bot" && (
        <div style={{ fontSize: 10, fontWeight: 700, color: "#d946ef", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
          <Bot size={10} /> Bookbot
        </div>
      )}
      {msg.text}
      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chats"); // chats | requests | bot
  const [activeChat, setActiveChat] = useState(MOCK_USERS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [botMessages, setBotMessages] = useState([
    { from: "bot", text: "👋 Hi! I'm **Bookbot** — your reading assistant. Ask me for book recommendations, writing tips, or anything book-related!", time: "now" },
  ]);
  const [botInput, setBotInput] = useState("");
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);
  const botEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  useEffect(() => {
    botEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages]);

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;
    const newMsg = { from: "me", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg],
    }));
    setInput("");
    // Simulate reply after 1.2s
    setTimeout(() => {
      const reply = { from: "them", text: "That sounds amazing! 📚 Let's chat more about it.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setMessages(prev => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), reply],
      }));
    }, 1200);
  };

  const sendBotMessage = () => {
    if (!botInput.trim()) return;
    const userMsg = { from: "me", text: botInput, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setBotMessages(prev => [...prev, userMsg]);
    const question = botInput;
    setBotInput("");
    setIsBotTyping(true);
    setTimeout(() => {
      const reply = { from: "bot", text: getBotReply(question), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
      setBotMessages(prev => [...prev, reply]);
      setIsBotTyping(false);
    }, 900);
  };

  const acceptRequest = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast.success("Follow request accepted!");
  };

  const declineRequest = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    toast("Request declined");
  };

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  const currentMessages = activeChat ? (messages[activeChat.id] || []) : [];

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)}hideTopbar={true}>
      <div style={pageStyles.wrap}>

        {/* ── LEFT PANEL ── */}
        <div style={pageStyles.leftPanel}>

          {/* Header */}
          <div style={pageStyles.leftHeader}>
            <h2 style={pageStyles.leftTitle}>Messages</h2>
            {requests.length > 0 && (
              <div style={pageStyles.requestBadge}>{requests.length} requests</div>
            )}
          </div>

          {/* Tabs */}
          <div style={pageStyles.tabs}>
            {[
              { id: "chats",    label: "Chats",    icon: <MessageCircle size={13} /> },
              { id: "requests", label: "Requests", icon: <UserPlus size={13} />, count: requests.length },
              { id: "bot",      label: "Bookbot",  icon: <Bot size={13} /> },
            ].map(tab => (
              <button
                key={tab.id}
                style={{ ...pageStyles.tab, ...(activeTab === tab.id ? pageStyles.tabActive : {}) }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
                {tab.count > 0 && <span style={pageStyles.tabBadge}>{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Search */}
          {activeTab === "chats" && (
            <div style={pageStyles.searchWrap}>
              <Search size={13} style={pageStyles.searchIcon} />
              <input
                style={pageStyles.searchInput}
                placeholder="Search conversations…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {/* Content by tab */}
          <div style={pageStyles.listWrap}>

            {/* CHATS */}
            {activeTab === "chats" && (
              filteredUsers.length === 0
                ? <div style={pageStyles.emptyList}>No conversations found</div>
                : filteredUsers.map(u => (
                  <UserListItem
                    key={u.id}
                    user={u}
                    active={activeChat?.id === u.id}
                    onClick={() => { setActiveChat(u); setActiveTab("chats"); }}
                  />
                ))
            )}

            {/* FOLLOW REQUESTS */}
            {activeTab === "requests" && (
              requests.length === 0
                ? (
                  <div style={pageStyles.emptyList}>
                    <UserCheck size={32} color="#d946ef" opacity={0.3} />
                    <p style={{ marginTop: 10, fontSize: 13, color: "#9ca3af" }}>No pending requests</p>
                  </div>
                )
                : requests.map(r => (
                  <div key={r.id} style={reqStyles.card}>
                    <div style={{ ...reqStyles.avatar, background: `${r.color}22`, color: r.color }}>
                      {r.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={reqStyles.name}>{r.name}</div>
                      <div style={reqStyles.handle}>{r.handle}</div>
                      <div style={reqStyles.wants}>wants to follow you</div>
                    </div>
                    <div style={reqStyles.actions}>
                      <button style={reqStyles.acceptBtn} onClick={() => acceptRequest(r.id)}>
                        <UserCheck size={12} /> Accept
                      </button>
                      <button style={reqStyles.declineBtn} onClick={() => declineRequest(r.id)}>
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))
            )}

            {/* BOOKBOT preview in list */}
            {activeTab === "bot" && (
              <div
                style={{ ...listStyles.item, background: "linear-gradient(135deg, #fdf4ff, #ede9fe)", borderLeft: "3px solid #d946ef", cursor: "pointer" }}
                onClick={() => setActiveTab("bot")}
              >
                <div style={{ ...listStyles.avatar, background: "linear-gradient(135deg, #d946ef, #818cf8)", color: "#fff" }}>
                  <Bot size={16} />
                </div>
                <div style={listStyles.info}>
                  <div style={{ ...listStyles.name, color: "#d946ef" }}>Bookbot ✨</div>
                  <div style={listStyles.lastMsg}>Ask me for book recommendations!</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: CHAT AREA ── */}
        <div style={pageStyles.chatArea}>

          {/* CHAT with user */}
          {activeTab === "chats" && activeChat && (
            <>
              {/* Chat header */}
              <div style={chatStyles.header}>
                <div style={{ ...chatStyles.headerAvatar, background: `${activeChat.color}22`, color: activeChat.color }}>
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <div style={chatStyles.headerName}>{activeChat.name}</div>
                  <div style={chatStyles.headerHandle}>{activeChat.handle}</div>
                </div>
                <button
                  style={chatStyles.followBtn}
                  onClick={() => toast.success(`Following ${activeChat.name}!`)}
                >
                  <UserPlus size={13} /> Follow
                </button>
                <button
                  style={chatStyles.profileBtn}
                  onClick={() => navigate(`/profile`)}
                >
                  View Profile <ChevronRight size={13} />
                </button>
              </div>

              {/* Messages */}
              <div style={chatStyles.messages}>
                {currentMessages.length === 0 ? (
                  <div style={chatStyles.emptyChat}>
                    <MessageCircle size={40} color="#d946ef" opacity={0.2} />
                    <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 10 }}>
                      Start a conversation with {activeChat.name}!
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg, i) => <ChatBubble key={i} msg={msg} />)
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={chatStyles.inputWrap}>
                <input
                  style={chatStyles.input}
                  placeholder={`Message ${activeChat.name}…`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <button
                  style={{ ...chatStyles.sendBtn, opacity: input.trim() ? 1 : 0.5 }}
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}

          {/* BOOKBOT chat */}
          {activeTab === "bot" && (
            <>
              <div style={chatStyles.header}>
                <div style={{ ...chatStyles.headerAvatar, background: "linear-gradient(135deg, #d946ef, #818cf8)", color: "#fff" }}>
                  <Bot size={18} />
                </div>
                <div>
                  <div style={{ ...chatStyles.headerName, color: "#d946ef" }}>Bookbot ✨</div>
                  <div style={chatStyles.headerHandle}>Your AI reading assistant</div>
                </div>
                <div style={botStyles.badge}>
                  <Sparkles size={11} /> AI Powered
                </div>
              </div>

              {/* Bot quick prompts */}
              <div style={botStyles.prompts}>
                {["Recommend a fantasy book 🐉", "Give me a writing tip ✍️", "Best romance novels 💕"].map((p, i) => (
                  <button
                    key={i}
                    style={botStyles.promptBtn}
                    onClick={() => {
                      setBotInput(p);
                      setTimeout(() => {
                        const userMsg = { from: "me", text: p, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
                        setBotMessages(prev => [...prev, userMsg]);
                        setIsBotTyping(true);
                        setTimeout(() => {
                          setBotMessages(prev => [...prev, { from: "bot", text: getBotReply(p), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
                          setIsBotTyping(false);
                        }, 900);
                        setBotInput("");
                      }, 50);
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div style={chatStyles.messages}>
                {botMessages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
                {isBotTyping && (
                  <div style={{ display: "flex", gap: 4, padding: "8px 14px", alignItems: "center" }}>
                    <div style={botStyles.typingDot} />
                    <div style={{ ...botStyles.typingDot, animationDelay: "0.15s" }} />
                    <div style={{ ...botStyles.typingDot, animationDelay: "0.3s" }} />
                    <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>Bookbot is thinking…</span>
                  </div>
                )}
                <div ref={botEndRef} />
              </div>

              <div style={chatStyles.inputWrap}>
                <input
                  style={chatStyles.input}
                  placeholder="Ask Bookbot anything about books…"
                  value={botInput}
                  onChange={e => setBotInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendBotMessage()}
                />
                <button
                  style={{ ...chatStyles.sendBtn, opacity: botInput.trim() ? 1 : 0.5 }}
                  onClick={sendBotMessage}
                  disabled={!botInput.trim()}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}

          {/* REQUESTS tab — show placeholder in chat area */}
          {activeTab === "requests" && (
            <div style={chatStyles.emptyChat}>
              <UserPlus size={48} color="#d946ef" opacity={0.2} />
              <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginTop: 14 }}>Follow Requests</p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>
                {requests.length > 0 ? `You have ${requests.length} pending request${requests.length > 1 ? "s" : ""}` : "No pending requests"}
              </p>
            </div>
          )}
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
  wrap: { display: "flex", height: "calc(100vh - 58px)", background: "#fdfaff", overflow: "hidden" },
  leftPanel: {
    width: 300, borderRight: "1px solid #f3e8ff",
    background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0,
  },
  leftHeader: {
    padding: "20px 18px 12px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  leftTitle: { fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 },
  requestBadge: {
    fontSize: 11, fontWeight: 600, color: "#d946ef",
    background: "#fdf4ff", border: "1px solid #f3e8ff",
    padding: "3px 8px", borderRadius: 20,
  },
  tabs: { display: "flex", gap: 4, padding: "0 12px 12px" },
  tab: {
    display: "flex", alignItems: "center", gap: 5,
    flex: 1, padding: "7px 6px", borderRadius: 10,
    border: "1px solid #f3e8ff", background: "#fdfaff",
    fontSize: 11, fontWeight: 500, color: "#6b7280",
    cursor: "pointer", fontFamily: "inherit", justifyContent: "center",
    position: "relative",
  },
  tabActive: {
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "1px solid transparent",
    boxShadow: "0 2px 8px rgba(217,70,239,0.3)",
  },
  tabBadge: {
    position: "absolute", top: -4, right: -4,
    background: "#ef4444", color: "#fff",
    fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10,
  },
  searchWrap: { position: "relative", margin: "0 12px 10px" },
  searchIcon: { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" },
  searchInput: {
    width: "100%", background: "#fdfaff", border: "1px solid #f3e8ff",
    borderRadius: 20, padding: "7px 14px 7px 30px", fontSize: 12,
    fontFamily: "inherit", color: "#111827", outline: "none",
    boxSizing: "border-box",
  },
  listWrap: { flex: 1, overflowY: "auto" },
  emptyList: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "40px 20px",
    fontSize: 13, color: "#9ca3af", textAlign: "center",
  },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
};

const listStyles = {
  item: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 16px", cursor: "pointer",
    borderBottom: "1px solid #fdf4ff",
    transition: "background 0.1s",
  },
  avatar: {
    width: 40, height: 40, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, fontWeight: 700, flexShrink: 0,
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 13, fontWeight: 600, color: "#111827" },
  lastMsg: { fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 },
  meta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 },
  time: { fontSize: 10, color: "#9ca3af" },
  unread: {
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", fontSize: 10, fontWeight: 700,
    padding: "2px 6px", borderRadius: 20,
  },
};

const chatStyles = {
  header: {
    padding: "14px 20px",
    borderBottom: "1px solid #f3e8ff",
    display: "flex", alignItems: "center", gap: 12,
    background: "#fff", flexShrink: 0,
  },
  headerAvatar: {
    width: 40, height: 40, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, fontWeight: 700, flexShrink: 0,
  },
  headerName: { fontSize: 14, fontWeight: 700, color: "#111827" },
  headerHandle: { fontSize: 11, color: "#9ca3af" },
  followBtn: {
    display: "flex", alignItems: "center", gap: 5,
    marginLeft: "auto", padding: "6px 14px",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "none", borderRadius: 20,
    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 2px 8px rgba(217,70,239,0.3)",
  },
  profileBtn: {
    display: "flex", alignItems: "center", gap: 4,
    padding: "6px 12px",
    background: "#fdfaff", border: "1px solid #f3e8ff",
    color: "#6b7280", borderRadius: 20,
    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
  },
  messages: {
    flex: 1, overflowY: "auto",
    padding: "20px 24px",
    background: "#fdfaff",
  },
  emptyChat: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    background: "#fdfaff",
  },
  inputWrap: {
    display: "flex", gap: 10, alignItems: "center",
    padding: "14px 20px",
    borderTop: "1px solid #f3e8ff",
    background: "#fff", flexShrink: 0,
  },
  input: {
    flex: 1, background: "#fdfaff", border: "1px solid #f3e8ff",
    borderRadius: 24, padding: "10px 18px",
    fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none",
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    border: "none", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", boxShadow: "0 2px 8px rgba(217,70,239,0.3)",
    flexShrink: 0,
  },
};

const reqStyles = {
  card: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 16px", borderBottom: "1px solid #fdf4ff",
  },
  avatar: {
    width: 40, height: 40, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, fontWeight: 700, flexShrink: 0,
  },
  name: { fontSize: 13, fontWeight: 600, color: "#111827" },
  handle: { fontSize: 11, color: "#9ca3af" },
  wants: { fontSize: 11, color: "#d946ef", marginTop: 2 },
  actions: { display: "flex", gap: 6, flexShrink: 0 },
  acceptBtn: {
    display: "flex", alignItems: "center", gap: 4,
    padding: "5px 10px", borderRadius: 20,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "none", fontSize: 11, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  declineBtn: {
    width: 28, height: 28, borderRadius: "50%",
    background: "#fdf4ff", border: "1px solid #f3e8ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: "#9ca3af",
  },
};

const botStyles = {
  badge: {
    display: "flex", alignItems: "center", gap: 4,
    fontSize: 11, fontWeight: 600, color: "#818cf8",
    background: "#ede9fe", padding: "4px 10px", borderRadius: 20,
    marginLeft: "auto",
  },
  prompts: {
    display: "flex", gap: 8, padding: "10px 20px",
    borderBottom: "1px solid #f3e8ff",
    flexWrap: "wrap", background: "#fff", flexShrink: 0,
  },
  promptBtn: {
    padding: "6px 12px", borderRadius: 20,
    border: "1px solid #f3e8ff", background: "#fdfaff",
    fontSize: 11, fontWeight: 500, color: "#6b7280",
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  },
  typingDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#d946ef", opacity: 0.6,
    animation: "bounce 0.6s infinite alternate",
  },
};

export default MessagesPage;