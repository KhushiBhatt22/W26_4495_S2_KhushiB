import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, Compass, MessageSquare, Mail, User, Settings,
  Plus, Bell, Search, BookOpen, LogOut, X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NewDashboardLayout = ({ children, onCreateBook }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState(3);
  const profileRef = useRef(null);

  const navItems = [
    { id: "home",     label: "Home",     icon: Home,          path: "/newdashboard" },
    { id: "explore",  label: "Explore",  icon: Compass,       path: "/explore" },
    { id: "threads",  label: "Threads",  icon: MessageSquare, path: "/threads" },
    { id: "messages", label: "Messages", icon: Mail,          path: "/messages", badge: notifications },
    { id: "profile",  label: "Profile",  icon: User,          path: "/dashboard" },
    { id: "settings", label: "Settings", icon: Settings,      path: "/settings" },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div style={styles.shell}>

      {/* ══ SIDEBAR ══ */}
      <aside style={styles.sidebar}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>
            <BookOpen size={18} color="#fff" />
          </div>
          <span style={styles.logoText}>Bookstagram</span>
        </div>

        {/* Nav Items */}
        <nav style={styles.nav}>
          {navItems.map(({ id, label, icon: Icon, path, badge }) => {
            const active = isActive(path);
            return (
              <div
                key={id}
                style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}
                onClick={() => navigate(path)}
              >
                <Icon
                  size={19}
                  color={active ? "#d946ef" : "#9ca3af"}
                  strokeWidth={active ? 2.2 : 1.8}
                  style={{ flexShrink: 0 }}
                />
                <span style={{
                  ...styles.navLabel,
                  color: active ? "#d946ef" : "#4b5563",
                  fontWeight: active ? 600 : 500,
                }}>
                  {label}
                </span>
                {badge && <span style={styles.badge}>{badge}</span>}
              </div>
            );
          })}
        </nav>

        <div style={styles.divider} />

        {/* Create Button */}
        <div style={styles.createWrap}>
          <button style={styles.createBtn} onClick={onCreateBook}>
            <div style={styles.createPlus}>
              <Plus size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={styles.createLabel}>Create</span>
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Bottom Profile */}
        <div style={styles.sidebarProfile} onClick={() => navigate("/dashboard")}>
          <div style={styles.avatarCircle}>
            {user?.avatar
              ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              : <span style={styles.avatarLetter}>{avatarLetter}</span>
            }
          </div>
          <div style={styles.profileMeta}>
            <span style={styles.profileName}>{user?.name || "User"}</span>
            <span style={styles.profileHandle}>
              @{user?.name?.toLowerCase().replace(/\s+/g, "_") || "user"}
            </span>
          </div>
        </div>
      </aside>

      {/* ══ MAIN ══ */}
      <div style={styles.mainWrap}>

        {/* TOPBAR */}
        <header style={styles.topbar}>
          <div style={styles.searchWrap}>
            <Search size={14} style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search books, people, threads…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <X
                size={14}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#9ca3af" }}
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>

          <div style={styles.topActions}>
            <div style={styles.iconBtn}>
              <Bell size={18} color="#6b7280" strokeWidth={1.8} />
              <span style={styles.notifDot} />
            </div>

            <div ref={profileRef} style={{ position: "relative" }}>
              <div style={styles.topAvatar} onClick={() => setShowProfileMenu(v => !v)}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{avatarLetter}</span>
                }
              </div>

              {showProfileMenu && (
                <div style={styles.profileMenu}>
                  <div style={styles.menuHeader}>
                    <div style={styles.avatarCircle}>
                      {user?.avatar
                        ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        : <span style={styles.avatarLetter}>{avatarLetter}</span>
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{user?.name}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={styles.menuDivider} />
                  <div style={styles.menuItem} onClick={() => { navigate("/dashboard"); setShowProfileMenu(false); }}>
                    <User size={14} color="#6b7280" /> My Profile
                  </div>
                  <div style={styles.menuItem} onClick={() => { navigate("/settings"); setShowProfileMenu(false); }}>
                    <Settings size={14} color="#6b7280" /> Settings
                  </div>
                  <div style={styles.menuDivider} />
                  <div style={{ ...styles.menuItem, color: "#ef4444" }} onClick={logout}>
                    <LogOut size={14} color="#ef4444" /> Log Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

const styles = {
  shell: {
    display: "flex",
    height: "100vh",
    background: "#fdfaff",
    width: "100vw", 
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
  },
  sidebar: {
    width: 220,
    background: "#ffffff",
    borderRight: "1px solid #f3e8ff",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    height: "100vh",
    position: "sticky",
    top: 0,
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "20px 20px 16px",
    borderBottom: "1px solid #f3e8ff",
  },
  logoIcon: {
    width: 34, height: 34,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 10px rgba(217,70,239,0.35)",
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.3px",
  },
  nav: {
    padding: "12px 10px 4px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  navItemActive: {
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
  },
  navLabel: { fontSize: 14, flex: 1 },
  badge: {
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
  },
  divider: {
    height: 1,
    background: "#f3e8ff",
    margin: "8px 12px",
  },
  createWrap: { padding: "4px 10px" },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "11px 14px",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(217,70,239,0.35)",
  },
  createPlus: {
    width: 24, height: 24,
    background: "rgba(255,255,255,0.25)",
    borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  createLabel: { color: "#fff", fontSize: 14, fontWeight: 600 },
  sidebarProfile: {
    padding: "14px 16px",
    borderTop: "1px solid #f3e8ff",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  avatarCircle: {
    width: 36, height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  avatarLetter: { color: "#fff", fontWeight: 700, fontSize: 14 },
  profileMeta: {
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  profileName: {
    fontSize: 13, fontWeight: 600, color: "#111827",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  profileHandle: { fontSize: 11, color: "#9ca3af" },
  mainWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  topbar: {
    height: 58,
    background: "#ffffff",
    borderBottom: "1px solid #f3e8ff",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    gap: 14,
    flexShrink: 0,
    position: "sticky",
    top: 0,
    zIndex: 30,
  },
  searchWrap: {
    flex: 1,
    maxWidth: 440,
    position: "relative",
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
    padding: "8px 16px 8px 36px",
    fontSize: 13,
    fontFamily: "inherit",
    color: "#111827",
    outline: "none",
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
  },
  iconBtn: {
    width: 36, height: 36,
    borderRadius: "50%",
    background: "#fdfaff",
    border: "1px solid #f3e8ff",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 6, right: 6,
    width: 8, height: 8,
    background: "#d946ef",
    borderRadius: "50%",
    border: "2px solid #fff",
  },
  topAvatar: {
    width: 34, height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    border: "2px solid #f3e8ff",
    overflow: "hidden",
  },
  profileMenu: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    background: "#fff",
    border: "1px solid #f3e8ff",
    borderRadius: 12,
    boxShadow: "0 8px 30px rgba(217,70,239,0.12)",
    minWidth: 210,
    zIndex: 100,
    overflow: "hidden",
  },
  menuHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
  },
  menuDivider: { height: 1, background: "#f3e8ff" },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "11px 16px",
    fontSize: 13,
    color: "#374151",
    cursor: "pointer",
  },
  pageContent: {
    flex: 1,
    overflowY: "auto",
  },
};

export default NewDashboardLayout;
