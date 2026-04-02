import { useState, useEffect, useRef } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import {
  Send, Bot, UserPlus, Search,
  MessageCircle, Sparkles, X, ChevronRight, UserCheck
} from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import socket from "../utils/socket";

const BASE_URL = "http://localhost:8000";

const getAvatar = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${BASE_URL}${avatar}`;
};

// Bot responses
const BOT_RESPONSES = [
  (q) => q.toLowerCase().includes("recommend") || q.toLowerCase().includes("book")
    ? "I'd recommend The Stormlight Archive by Brandon Sanderson or The Night Circus by Erin Morgenstern!"
    : null,
  (q) => q.toLowerCase().includes("hello") || q.toLowerCase().includes("hi")
    ? "Hey! I'm Bookbot — ask me for book recommendations or writing tips!"
    : null,
  (q) => q.toLowerCase().includes("fantasy")
    ? "Top fantasy picks: Mistborn, Name of the Wind, A Court of Thorns and Roses!"
    : null,
  (q) => q.toLowerCase().includes("romance")
    ? " For romance: The Hating Game, Beach Read, It Ends with Us!"
    : null,
  (q) => q.toLowerCase().includes("tip") || q.toLowerCase().includes("write")
    ? " Writing tip: Start strong, write your ending first, don't edit while drafting!"
    : null,
  () => "Try asking me for book recommendations or writing tips — that's where I shine! 📖",
];

const getBotReply = (q) => {
  for (const fn of BOT_RESPONSES) {
    const r = fn(q);
    if (r) return r;
  }
  return BOT_RESPONSES[BOT_RESPONSES.length - 1]();
};

const ChatBubble = ({ msg, isMe }) => (
  <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 10 }}>
    <div style={{
      maxWidth: "68%", padding: "10px 14px",
      borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      background: isMe
        ? "linear-gradient(135deg, #d946ef, #fb923c)"
        : msg.from === "bot" ? "linear-gradient(135deg, #fdf4ff, #ede9fe)" : "#f3f4f6",
      color: isMe ? "#fff" : "#111827",
      fontSize: 13, lineHeight: 1.55,
      boxShadow: isMe ? "0 2px 10px rgba(217,70,239,0.25)" : "0 1px 4px rgba(0,0,0,0.06)",
    }}>
      {msg.from === "bot" && (
        <div style={{ fontSize: 10, fontWeight: 700, color: "#d946ef", marginBottom: 4 }}>🤖 Bookbot</div>
      )}
      {msg.text}
      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>
        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : msg.time}
      </div>
    </div>
  </div>
);

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("chats");
  const [conversations, setConversations] = useState([]);
  const [messageableUsers, setMessageableUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Bot
  const [botMessages, setBotMessages] = useState([
    { from: "bot", text: "Hi! I'm Bookbot — ask me for book recommendations or writing tips!", time: "now" },
  ]);
  const [botInput, setBotInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  const chatEndRef = useRef(null);
  const botEndRef = useRef(null);
  const location = useLocation();

  // Connect socket
  useEffect(() => {
    if (!user?._id) return;
    socket.connect();
    socket.emit("join", user._id);

    socket.on("receiveMessage", (msg) => {
      if (activeChat?._id === msg.senderId) {
        setMessages(prev => [...prev, msg]);
      } else {
        toast(`💬 New message!`);
      }
      fetchConversations();
    });

    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [user, activeChat]);

  useEffect(() => {
    fetchConversations();
    fetchMessageableUsers();
  }, []);

  // Auto open chat if navigated from profile
  useEffect(() => {
    if (location.state?.openChat) {
      openChat(location.state.openChat);
    }
  }, [messageableUsers]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    botEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages]);

  const fetchConversations = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.MESSAGES.GET_CONVERSATIONS);
      setConversations(res.data || []);
    } catch {
      console.error("Failed to load conversations");
    }
  };

  const fetchMessageableUsers = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.MESSAGES.GET_USERS);
      setMessageableUsers(res.data || []);
    } catch {
      console.error("Failed to load users");
    }
  };

  const openChat = async (chatUser) => {
    setActiveChat(chatUser);
    setLoadingMsgs(true);
    try {
      const res = await axiosInstance.get(API_PATHS.MESSAGES.GET_MESSAGES(chatUser._id));
      setMessages(res.data || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeChat) return;
    const text = input;
    setInput("");

    try {
      const res = await axiosInstance.post(API_PATHS.MESSAGES.SEND_MESSAGE, {
        receiverId: activeChat._id,
        text,
      });
      const newMsg = res.data;
      setMessages(prev => [...prev, newMsg]);

      // Emit via socket for real-time
      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: activeChat._id,
        text,
        messageId: newMsg._id,
        createdAt: newMsg.createdAt,
      });

      fetchConversations();
    } catch {
      toast.error("Failed to send message");
    }
  };

  const sendBotMessage = () => {
    if (!botInput.trim()) return;
    const userMsg = { from: "me", text: botInput, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setBotMessages(prev => [...prev, userMsg]);
    const question = botInput;
    setBotInput("");
    setIsBotTyping(true);
    setTimeout(() => {
      setBotMessages(prev => [...prev, { from: "bot", text: getBotReply(question), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      setIsBotTyping(false);
    }, 900);
  };

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    localStorage.setItem("newlyCreatedBookId", bookId); // ← mark as new
    navigate(`/editor/${bookId}`);
  };

  const filteredConversations = conversations.filter(c =>
    c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Users I can start new chat with (not already in conversations)
  const conversationUserIds = new Set(conversations.map(c => c.user?._id?.toString()));
  const newChatUsers = messageableUsers.filter(u => !conversationUserIds.has(u._id?.toString()));

  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)} hideTopbar={true}>
      <div style={pageStyles.wrap}>

        {/* LEFT PANEL */}
        <div style={pageStyles.leftPanel}>
          <div style={pageStyles.leftHeader}>
            <h2 style={pageStyles.leftTitle}>Messages</h2>
          </div>

          {/* Tabs */}
          <div style={pageStyles.tabs}>
            {[
              { id: "chats", label: "Chats", icon: <MessageCircle size={13} /> },
              { id: "bot", label: "Bookbot", icon: <Bot size={13} /> },
            ].map(tab => (
              <button key={tab.id}
                style={{ ...pageStyles.tab, ...(activeTab === tab.id ? pageStyles.tabActive : {}) }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
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

          <div style={pageStyles.listWrap}>
            {activeTab === "chats" && (
              <>
                {/* Existing conversations */}
                {filteredConversations.map(conv => (
                  <div key={conv.user._id}
                    style={{
                      ...listStyles.item,
                      background: activeChat?._id === conv.user._id ? "linear-gradient(135deg, #fdf4ff, #fff7ed)" : "transparent",
                      borderLeft: activeChat?._id === conv.user._id ? "3px solid #d946ef" : "3px solid transparent",
                    }}
                    onClick={() => openChat(conv.user)}
                  >
                    <div style={listStyles.avatar}>
                      {getAvatar(conv.user.avatar)
                        ? <img src={getAvatar(conv.user.avatar)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        : conv.user.name?.charAt(0).toUpperCase()
                      }
                    </div>
                    <div style={listStyles.info}>
                      <div style={listStyles.name}>{conv.user.name}</div>
                      <div style={listStyles.lastMsg}>{conv.lastMessage}</div>
                    </div>
                    <div style={listStyles.meta}>
                      <div style={listStyles.time}>
                        {conv.lastTime ? new Date(conv.lastTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                      {conv.unread > 0 && <div style={listStyles.unread}>{conv.unread}</div>}
                    </div>
                  </div>
                ))}

                {/* New chat users */}
                {newChatUsers.length > 0 && (
                  <>
                    <div style={{ padding: "10px 16px 4px", fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>
                      Start New Chat
                    </div>
                    {newChatUsers.map(u => (
                      <div key={u._id}
                        style={{ ...listStyles.item, borderLeft: "3px solid transparent" }}
                        onClick={() => openChat(u)}
                      >
                        <div style={listStyles.avatar}>
                          {getAvatar(u.avatar)
                            ? <img src={getAvatar(u.avatar)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                            : u.name?.charAt(0).toUpperCase()
                          }
                        </div>
                        <div style={listStyles.info}>
                          <div style={listStyles.name}>{u.name}</div>
                          <div style={listStyles.lastMsg}>Start a conversation</div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {filteredConversations.length === 0 && newChatUsers.length === 0 && (
                  <div style={pageStyles.emptyList}>
                    <MessageCircle size={32} color="#d946ef" opacity={0.3} />
                    <p style={{ marginTop: 10, fontSize: 13, color: "#9ca3af" }}>
                      Follow people to start chatting!
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "bot" && (
              <div style={{ ...listStyles.item, background: "linear-gradient(135deg, #fdf4ff, #ede9fe)", borderLeft: "3px solid #d946ef" }}>
                <div style={{ ...listStyles.avatar, background: "linear-gradient(135deg, #d946ef, #818cf8)", color: "#fff" }}>
                  <Bot size={16} />
                </div>
                <div style={listStyles.info}>
                  <div style={{ ...listStyles.name, color: "#d946ef" }}>Bookbot ✨</div>
                  <div style={listStyles.lastMsg}>Ask me for recommendations!</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={pageStyles.chatArea}>

          {/* Real chat */}
          {activeTab === "chats" && activeChat && (
            <>
              <div style={chatStyles.header}>
                <div style={chatStyles.headerAvatar}>
                  {getAvatar(activeChat.avatar)
                    ? <img src={getAvatar(activeChat.avatar)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : activeChat.name?.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <div style={chatStyles.headerName}>{activeChat.name}</div>
                  <div style={chatStyles.headerHandle}>@{activeChat.name?.toLowerCase().replace(/\s+/g, "_")}</div>
                </div>
                <button style={chatStyles.profileBtn} onClick={() => navigate(`/profile/${activeChat._id}`)}>
                  View Profile <ChevronRight size={13} />
                </button>
              </div>

              <div style={chatStyles.messages}>
                {loadingMsgs ? (
                  <div style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, marginTop: 40 }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={chatStyles.emptyChat}>
                    <MessageCircle size={40} color="#d946ef" opacity={0.2} />
                    <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 10 }}>
                      Start a conversation with {activeChat.name}!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <ChatBubble
                      key={msg._id || i}
                      msg={msg}
                      isMe={msg.senderId?.toString() === user._id?.toString() || msg.senderId === user._id}
                    />
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

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

          {/* Bot chat */}
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
                <div style={botStyles.badge}><Sparkles size={11} /> AI Powered</div>
              </div>

              <div style={botStyles.prompts}>
                {["Recommend a fantasy book", "Give me a writing tip ", "Best romance novels "].map((p, i) => (
                  <button key={i} style={botStyles.promptBtn}
                    onClick={() => {
                      const userMsg = { from: "me", text: p, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
                      setBotMessages(prev => [...prev, userMsg]);
                      setIsBotTyping(true);
                      setTimeout(() => {
                        setBotMessages(prev => [...prev, { from: "bot", text: getBotReply(p), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
                        setIsBotTyping(false);
                      }, 900);
                    }}
                  >{p}</button>
                ))}
              </div>

              <div style={chatStyles.messages}>
                {botMessages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} isMe={msg.from === "me"} />
                ))}
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

          {/* No chat selected */}
          {activeTab === "chats" && !activeChat && (
            <div style={chatStyles.emptyChat}>
              <MessageCircle size={48} color="#d946ef" opacity={0.2} />
              <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginTop: 14 }}>Select a conversation</p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4 }}>Choose someone from the left to start chatting!</p>
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

// Styles (same as before)
const pageStyles = {
  wrap: { display: "flex", height: "100vh", background: "#fdfaff", overflow: "hidden" },
  leftPanel: { width: 300, borderRight: "1px solid #f3e8ff", background: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 },
  leftHeader: { padding: "20px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  leftTitle: { fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 },
  tabs: { display: "flex", gap: 4, padding: "0 12px 12px" },
  tab: { display: "flex", alignItems: "center", gap: 5, flex: 1, padding: "7px 6px", borderRadius: 10, border: "1px solid #f3e8ff", background: "#fdfaff", fontSize: 11, fontWeight: 500, color: "#6b7280", cursor: "pointer", fontFamily: "inherit", justifyContent: "center" },
  tabActive: { background: "linear-gradient(135deg, #d946ef, #fb923c)", color: "#fff", border: "1px solid transparent", boxShadow: "0 2px 8px rgba(217,70,239,0.3)" },
  searchWrap: { position: "relative", margin: "0 12px 10px" },
  searchIcon: { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" },
  searchInput: { width: "100%", background: "#fdfaff", border: "1px solid #f3e8ff", borderRadius: 20, padding: "7px 14px 7px 30px", fontSize: 12, fontFamily: "inherit", color: "#111827", outline: "none", boxSizing: "border-box" },
  listWrap: { flex: 1, overflowY: "auto" },
  emptyList: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", fontSize: 13, color: "#9ca3af", textAlign: "center" },
  chatArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
};

const listStyles = {
  item: { display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #fdf4ff", transition: "background 0.1s" },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #d946ef, #fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 13, fontWeight: 600, color: "#111827" },
  lastMsg: { fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 },
  meta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 },
  time: { fontSize: 10, color: "#9ca3af" },
  unread: { background: "linear-gradient(135deg, #d946ef, #fb923c)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 20 },
};

const chatStyles = {
  header: { padding: "14px 20px", borderBottom: "1px solid #f3e8ff", display: "flex", alignItems: "center", gap: 12, background: "#fff", flexShrink: 0 },
  headerAvatar: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #d946ef, #fb923c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" },
  headerName: { fontSize: 14, fontWeight: 700, color: "#111827" },
  headerHandle: { fontSize: 11, color: "#9ca3af" },
  profileBtn: { display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#fdfaff", border: "1px solid #f3e8ff", color: "#6b7280", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto" },
  messages: { flex: 1, overflowY: "auto", padding: "20px 24px", background: "#fdfaff" },
  emptyChat: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#fdfaff" },
  inputWrap: { display: "flex", gap: 10, alignItems: "center", padding: "14px 20px", borderTop: "1px solid #f3e8ff", background: "#fff", flexShrink: 0 },
  input: { flex: 1, background: "#fdfaff", border: "1px solid #f3e8ff", borderRadius: 24, padding: "10px 18px", fontSize: 13, fontFamily: "inherit", color: "#111827", outline: "none" },
  sendBtn: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #d946ef, #fb923c)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(217,70,239,0.3)", flexShrink: 0 },
};

const botStyles = {
  badge: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#818cf8", background: "#ede9fe", padding: "4px 10px", borderRadius: 20, marginLeft: "auto" },
  prompts: { display: "flex", gap: 8, padding: "10px 20px", borderBottom: "1px solid #f3e8ff", flexWrap: "wrap", background: "#fff", flexShrink: 0 },
  promptBtn: { padding: "6px 12px", borderRadius: 20, border: "1px solid #f3e8ff", background: "#fdfaff", fontSize: 11, fontWeight: 500, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" },
  typingDot: { width: 7, height: 7, borderRadius: "50%", background: "#d946ef", opacity: 0.6, animation: "bounce 0.6s infinite alternate" },
};

export default MessagesPage;