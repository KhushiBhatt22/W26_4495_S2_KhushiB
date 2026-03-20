import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Lock, Bell, Palette, Shield, LogOut,
  Save, Eye, EyeOff, ChevronRight, Camera
} from "lucide-react";
import toast from "react-hot-toast";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";
import CreateBookModal from "../components/modals/CreateBookModal";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";

const SECTIONS = [
  { id: "profile", label: "Edit Profile", icon: User },
  { id: "password", label: "Change Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy & Safety", icon: Shield },
];

const SettingsPage = () => {
  const { user, logout, updateUser, updateAppearance } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState("profile");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // ── Profile form ────────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });

  // ── Password form ────────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    current: "", newPass: "", confirm: ""
  });
  const [showPass, setShowPass] = useState({
    current: false, new: false, confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ── Notification prefs ───────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    newFollower: true, bookLike: true, comment: true,
    threadReply: false, newsletter: false,
  });

  // ── Appearance ───────────────────────────────────────────────────────────────
  const [appearance, setAppearance] = useState({
    theme: localStorage.getItem("theme") || "light",
    fontSize: localStorage.getItem("fontSize") || "medium"
  });

  // ── Privacy ──────────────────────────────────────────────────────────────────
  const [privacy, setPrivacy] = useState({
    privateAccount: false, showActivity: true, allowMessages: true,
  });

  // ── Get avatar display URL ───────────────────────────────────────────────────
  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (profileForm.avatar) {
      if (profileForm.avatar.startsWith("http")) return profileForm.avatar;
      return `${BASE_URL}${profileForm.avatar}`;
    }
    return null;
  };

  // ── Upload photo ─────────────────────────────────────────────────────────────
  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview
    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axiosInstance.put("/api/auth/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfileForm(p => ({ ...p, avatar: res.data.avatar }));
      updateUser({ avatar: res.data.avatar });
      toast.success("Profile photo updated! ✨");
    } catch {
      toast.error("Failed to upload photo");
      setAvatarPreview(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // ── Save profile (name + bio + avatar) ───────────────────────────────────────
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        name: profileForm.name,
        bio: profileForm.bio,
        avatar: profileForm.avatar,
      });
      updateUser({
        name: res.data.name,
        bio: res.data.bio,
        avatar: res.data.avatar,
      });
      toast.success("Profile updated! 🎉");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Change password (calls real backend) ─────────────────────────────────────
  const handleSavePassword = async () => {
    if (!passwordForm.current) {
      toast.error("Enter your current password"); return;
    }
    if (!passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm) {
      toast.error("New passwords don't match!"); return;
    }
    if (passwordForm.newPass.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }

    setIsChangingPassword(true);
    try {
      await axiosInstance.put(API_PATHS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      });
      toast.success("Password changed! Use new password next login ✅");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleBookCreated = (bookId) => {
    setIsCreateModalOpen(false);
    navigate(`/editor/${bookId}`);
  };

  // ── Render section ────────────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {

      // ── EDIT PROFILE ──────────────────────────────────────────────────────────
      case "profile": return (
        <div style={formStyles.wrap}>
          <div style={formStyles.sectionTitle}>Edit Profile</div>
          <div style={formStyles.sectionSubtitle}>Update your public profile information</div>

          {/* Avatar upload */}
          <div style={formStyles.avatarRow}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={formStyles.avatarCircle}>
                {getAvatarUrl()
                  ? <img src={getAvatarUrl()} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : <span style={{ color: "#fff", fontWeight: 700, fontSize: 28 }}>{user?.name?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div
                style={formStyles.cameraBadge}
                onClick={() => fileInputRef.current?.click()}
                title="JPG, PNG or GIF · Max 2MB"
              >

                {isUploadingPhoto
                  ? <div style={formStyles.spinner} />
                  : <Camera size={12} color="#fff" />
                }
              </div>
            </div>

            <div>
              <div style={formStyles.avatarName}>{user?.name}</div>
              <div style={formStyles.avatarEmail}>{user?.email}</div>

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              style={{ display: "none" }}
              onChange={handlePhotoSelect}
            />
          </div>

          {/* Full Name */}
          <div style={formStyles.field}>
            <label style={formStyles.label}>Full Name</label>
            <input
              style={formStyles.input}
              value={profileForm.name}
              onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          {/* Email (disabled) */}
          <div style={formStyles.field}>
            <label style={formStyles.label}>Email</label>
            <input
              style={{ ...formStyles.input, background: "#f9fafb", color: "#9ca3af" }}
              value={profileForm.email}
              disabled
            />
            <span style={formStyles.hint}>Email cannot be changed</span>
          </div>

          {/* Bio */}
          <div style={formStyles.field}>
            <label style={formStyles.label}>Bio</label>
            <textarea
              style={{ ...formStyles.input, height: 90, resize: "none" }}
              value={profileForm.bio}
              onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell the world about your reading life… 📚"
              maxLength={160}
            />
            <span style={formStyles.hint}>{profileForm.bio.length}/160</span>
          </div>

          <button
            style={{ ...formStyles.saveBtn, opacity: isSaving ? 0.7 : 1 }}
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            <Save size={14} /> {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      );

      // ── CHANGE PASSWORD ───────────────────────────────────────────────────────
      case "password": return (
        <div style={formStyles.wrap}>
          <div style={formStyles.sectionTitle}>Change Password</div>
          <div style={formStyles.sectionSubtitle}>
            Keep your account secure. After saving, use your new password to log in.
          </div>

          {[
            { key: "current", label: "Current Password", showKey: "current", placeholder: "Enter current password" },
            { key: "newPass", label: "New Password", showKey: "new", placeholder: "Min 6 characters" },
            { key: "confirm", label: "Confirm Password", showKey: "confirm", placeholder: "Repeat new password" },
          ].map(({ key, label, showKey, placeholder }) => (
            <div key={key} style={formStyles.field}>
              <label style={formStyles.label}>{label}</label>
              <div style={formStyles.passwordWrap}>
                <input
                  style={{ ...formStyles.input, paddingRight: 44 }}
                  type={showPass[showKey] ? "text" : "password"}
                  value={passwordForm[key]}
                  onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
                <button
                  style={formStyles.eyeBtn}
                  onClick={() => setShowPass(p => ({ ...p, [showKey]: !p[showKey] }))}
                >
                  {showPass[showKey]
                    ? <EyeOff size={14} color="#9ca3af" />
                    : <Eye size={14} color="#9ca3af" />
                  }
                </button>
              </div>
            </div>
          ))}

          <button
            style={{ ...formStyles.saveBtn, opacity: isChangingPassword ? 0.7 : 1 }}
            onClick={handleSavePassword}
            disabled={isChangingPassword}
          >
            <Lock size={14} /> {isChangingPassword ? "Changing…" : "Change Password"}
          </button>
        </div>
      );

      // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
      case "notifications": return (
        <div style={formStyles.wrap}>
          <div style={formStyles.sectionTitle}>Notifications</div>
          <div style={formStyles.sectionSubtitle}>Choose what you want to be notified about</div>

          {[
            { key: "newFollower", label: "New Follower", desc: "When someone follows you" },
            { key: "bookLike", label: "Book Liked", desc: "When someone likes your book" },
            { key: "comment", label: "Comments", desc: "When someone comments on your book" },
            { key: "threadReply", label: "Thread Replies", desc: "When someone replies to your thread" },
            { key: "newsletter", label: "Weekly Newsletter", desc: "Book recommendations every week" },
          ].map(({ key, label, desc }) => (
            <div key={key} style={formStyles.toggleRow}>
              <div>
                <div style={formStyles.toggleLabel}>{label}</div>
                <div style={formStyles.toggleDesc}>{desc}</div>
              </div>
              <div
                style={{
                  ...formStyles.toggle,
                  background: notifs[key]
                    ? "linear-gradient(135deg, #d946ef, #fb923c)"
                    : "#e5e7eb"
                }}
                onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}
              >
                <div style={{
                  ...formStyles.toggleThumb,
                  transform: notifs[key] ? "translateX(20px)" : "translateX(2px)"
                }} />
              </div>
            </div>
          ))}

          <button
            style={formStyles.saveBtn}
            onClick={() => toast.success("Notification preferences saved!")}
          >
            <Save size={14} /> Save Preferences
          </button>
        </div>
      );

      // ── APPEARANCE ────────────────────────────────────────────────────────────
      case "appearance": return (
        <div style={formStyles.wrap}>
          <div style={formStyles.sectionTitle}>Appearance</div>
          <div style={formStyles.sectionSubtitle}>Customize how Bookstagram looks for you</div>

          <div style={formStyles.field}>
            <label style={formStyles.label}>Theme</label>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {["light", "dark"].map(t => (
                <div
                  key={t}
                  style={{
                    ...formStyles.themeCard,
                    border: appearance.theme === t ? "2px solid #d946ef" : "2px solid #f3e8ff",
                    background: t === "dark" ? "#1f2937" : "#fdfaff",
                  }}
                  onClick={() => setAppearance(p => ({ ...p, theme: t }))}
                >
                  <div style={{ fontSize: 22 }}>{t === "light" ? "☀️" : "🌙"}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 600, marginTop: 6,
                    textTransform: "capitalize",
                    color: t === "dark" ? "#fff" : "#111827",
                  }}>
                    {t}
                  </div>
                  {appearance.theme === t && (
                    <div style={formStyles.themeCheck}>✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={formStyles.field}>
            <label style={formStyles.label}>Font Size</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {["small", "medium", "large"].map(s => (
                <button
                  key={s}
                  style={{
                    ...formStyles.sizeBtn,
                    background: appearance.fontSize === s
                      ? "linear-gradient(135deg, #d946ef, #fb923c)"
                      : "#fdfaff",
                    color: appearance.fontSize === s ? "#fff" : "#6b7280",
                    border: appearance.fontSize === s ? "none" : "1px solid #f3e8ff",
                  }}
                  onClick={() => setAppearance(p => ({ ...p, fontSize: s }))}
                >
                  <span style={{ fontSize: s === "small" ? 10 : s === "medium" ? 13 : 16 }}>
                    {s}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            style={formStyles.saveBtn}
            onClick={() => {
              updateAppearance(appearance.theme, appearance.fontSize);
              toast.success("Appearance saved! ");
            }}
          >
            <Save size={14} /> Save Appearance
          </button>
        </div>
      );

      // ── PRIVACY & SAFETY ──────────────────────────────────────────────────────
      case "privacy": return (
        <div style={formStyles.wrap}>
          <div style={formStyles.sectionTitle}>Privacy & Safety</div>
          <div style={formStyles.sectionSubtitle}>
            Control who can see your content and interact with you
          </div>

          {[
            { key: "privateAccount", label: "Private Account", desc: "Only approved followers can see your books and threads" },
            { key: "showActivity", label: "Show Activity", desc: "Let others see when you were last active" },
            { key: "allowMessages", label: "Allow Messages", desc: "Let anyone message you, not just followers" },
          ].map(({ key, label, desc }) => (
            <div key={key} style={formStyles.toggleRow}>
              <div>
                <div style={formStyles.toggleLabel}>{label}</div>
                <div style={formStyles.toggleDesc}>{desc}</div>
              </div>
              <div
                style={{
                  ...formStyles.toggle,
                  background: privacy[key]
                    ? "linear-gradient(135deg, #d946ef, #fb923c)"
                    : "#e5e7eb"
                }}
                onClick={() => setPrivacy(p => ({ ...p, [key]: !p[key] }))}
              >
                <div style={{
                  ...formStyles.toggleThumb,
                  transform: privacy[key] ? "translateX(20px)" : "translateX(2px)"
                }} />
              </div>
            </div>
          ))}

          <div style={formStyles.dangerZone}>
            <div style={formStyles.dangerTitle}>⚠️ Danger Zone</div>
            <button style={formStyles.logoutBtn} onClick={logout}>
              <LogOut size={14} /> Log Out
            </button>
            <button
              style={formStyles.deleteBtn}
              onClick={() => toast.error("Please contact support to delete your account")}
            >
              Delete Account
            </button>
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <NewDashboardLayout onCreateBook={() => setIsCreateModalOpen(true)}>
      <div style={pageStyles.wrap}>

        {/* LEFT NAV */}
        <div style={pageStyles.leftNav}>
          <div style={pageStyles.navTitle}>Settings</div>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              style={{
                ...pageStyles.navItem,
                background: activeSection === id ? "linear-gradient(135deg, #fdf4ff, #fff7ed)" : "transparent",
                color: activeSection === id ? "#d946ef" : "#4b5563",
                fontWeight: activeSection === id ? 600 : 500,
                borderLeft: activeSection === id ? "3px solid #d946ef" : "3px solid transparent",
              }}
              onClick={() => setActiveSection(id)}
            >
              <Icon size={17} color={activeSection === id ? "#d946ef" : "#9ca3af"} />
              {label}
              <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />
            </div>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div style={pageStyles.content}>
          {renderSection()}
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
  leftNav: { width: 240, padding: "28px 12px", borderRight: "1px solid #f3e8ff", background: "#fff", flexShrink: 0 },
  navTitle: { fontSize: 18, fontWeight: 700, color: "#111827", padding: "0 12px", marginBottom: 16 },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "11px 12px", borderRadius: 10, cursor: "pointer",
    fontSize: 14, transition: "all 0.15s", marginBottom: 2,
  },
  content: { flex: 1, padding: "28px 40px", overflowY: "auto", maxWidth: 600 },
};

const formStyles = {
  wrap: {},
  sectionTitle: { fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: "#9ca3af", marginBottom: 28 },

  // avatar
  avatarRow: {
    display: "flex", alignItems: "center", gap: 20, marginBottom: 28,
    padding: 18, background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
    borderRadius: 14, border: "1px solid #f3e8ff",
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", flexShrink: 0,
    boxShadow: "0 4px 14px rgba(217,70,239,0.3)",
  },
  cameraBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: "50%",
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #fff", cursor: "pointer",
    boxShadow: "0 2px 6px rgba(217,70,239,0.4)",
    title: "JPG, PNG or GIF · Max 2MB",
  },
  spinner: {
    width: 12, height: 12, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #fff",
    animation: "spin 0.7s linear infinite",
  },
  avatarName: { fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 2 },
  avatarEmail: { fontSize: 12, color: "#9ca3af", marginBottom: 10 },
  uploadBtn: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "6px 14px", borderRadius: 20,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "none", fontSize: 12, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 2px 8px rgba(217,70,239,0.3)",
  },

  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #f3e8ff", borderRadius: 10,
    fontSize: 13, fontFamily: "inherit", color: "#111827",
    background: "#fdfaff", outline: "none", boxSizing: "border-box",
  },
  hint: { fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" },

  passwordWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", padding: 0,
  },

  saveBtn: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 24px", marginTop: 8,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "none", borderRadius: 24,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", boxShadow: "0 4px 14px rgba(217,70,239,0.3)",
  },

  toggleRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 0", borderBottom: "1px solid #f9fafb",
  },
  toggleLabel: { fontSize: 14, fontWeight: 600, color: "#111827" },
  toggleDesc: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    cursor: "pointer", position: "relative",
    transition: "background 0.2s", flexShrink: 0,
  },
  toggleThumb: {
    position: "absolute", top: 2, width: 20, height: 20, borderRadius: "50%",
    background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
    transition: "transform 0.2s",
  },

  themeCard: {
    width: 100, padding: "16px 12px", borderRadius: 12,
    display: "flex", flexDirection: "column", alignItems: "center",
    cursor: "pointer", position: "relative", transition: "border 0.15s",
  },
  themeCheck: {
    position: "absolute", top: 6, right: 8,
    fontSize: 11, fontWeight: 700, color: "#d946ef",
  },
  sizeBtn: {
    padding: "8px 16px", borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
  },

  dangerZone: {
    marginTop: 32, padding: 20,
    background: "#fff5f5", border: "1px solid #fee2e2", borderRadius: 14,
  },
  dangerTitle: { fontSize: 14, fontWeight: 700, color: "#ef4444", marginBottom: 14 },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
    padding: "9px 20px", marginBottom: 10, width: "100%",
    background: "#fff", border: "1.5px solid #fca5a5",
    color: "#ef4444", borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  deleteBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "9px 20px", width: "100%",
    background: "#ef4444", border: "none",
    color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
};

export default SettingsPage;
