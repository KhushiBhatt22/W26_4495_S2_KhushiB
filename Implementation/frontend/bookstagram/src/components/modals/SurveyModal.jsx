import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const GENRES = ["Fantasy", "Romance", "Mystery", "Sci-Fi", "Historical", "Thriller", "Self-Help", "Other"];
const AUDIENCES = ["Children", "Teens", "Young Adults", "Adults", "All Ages"];
const TIME_OPTIONS = ["Less than a week", "1-2 weeks", "1 month", "2-3 months", "6+ months"];

const SurveyModal = ({ bookId, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    age: "",
    gender: "",
    genre: "",
    targetAudience: "",
    timeTaken: "",
    wouldRecommend: "",
    rating: 0,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(API_PATHS.SURVEY.SUBMIT, { bookId, ...form, age: parseInt(form.age) });
      toast.success("Thanks for your feedback! 🎉");
      onClose();
    } catch {
      toast.error("Failed to submit survey");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = () => (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} onClick={() => set("rating", star)}
          style={{
            fontSize: 32, background: "none", border: "none",
            cursor: "pointer", opacity: form.rating >= star ? 1 : 0.3,
            transform: form.rating >= star ? "scale(1.2)" : "scale(1)",
            transition: "all 0.15s",
          }}>⭐</button>
      ))}
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: 32,
        width: "100%", maxWidth: 480,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📝</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>
            Quick Survey
          </h2>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
            Help us understand our authors better!
          </p>
          {/* Progress */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                height: 4, width: 60, borderRadius: 4,
                background: step >= s ? "linear-gradient(135deg, #d946ef, #fb923c)" : "#f3e8ff",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>Step {step} of 3</p>
        </div>

        {/* Step 1 — About You */}
        {step === 1 && (
          <div>
            <h3 style={s.stepTitle}>👤 About You</h3>

            {/* Age */}
            <div style={s.field}>
              <label style={s.label}>Your Age</label>
              <input type="number" min="10" max="100"
                value={form.age} onChange={e => set("age", e.target.value)}
                placeholder="Enter your age"
                style={s.input}
              />
            </div>

            {/* Gender */}
            <div style={s.field}>
              <label style={s.label}>Your Gender</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["male", "female", "other"].map(g => (
                  <button key={g} onClick={() => set("gender", g)}
                    style={{
                      ...s.optionBtn,
                      border: form.gender === g ? "2px solid #d946ef" : "2px solid #f3e8ff",
                      background: form.gender === g ? "linear-gradient(135deg, #fdf4ff, #fff7ed)" : "#fff",
                      color: form.gender === g ? "#d946ef" : "#6b7280",
                    }}>
                    {g === "male" ? "👨 Male" : g === "female" ? "👩 Female" : "🧑 Other"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.age || !form.gender}
              style={{ ...s.nextBtn, opacity: form.age && form.gender ? 1 : 0.5 }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2 — About Your Book */}
        {step === 2 && (
          <div>
            <h3 style={s.stepTitle}>📚 About Your Book</h3>

            {/* Genre */}
            <div style={s.field}>
              <label style={s.label}>Genre</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GENRES.map(g => (
                  <button key={g} onClick={() => set("genre", g)}
                    style={{
                      ...s.chipBtn,
                      background: form.genre === g ? "linear-gradient(135deg, #d946ef, #fb923c)" : "#fdfaff",
                      color: form.genre === g ? "#fff" : "#6b7280",
                      border: form.genre === g ? "none" : "1px solid #f3e8ff",
                    }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div style={s.field}>
              <label style={s.label}>Target Audience</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {AUDIENCES.map(a => (
                  <button key={a} onClick={() => set("targetAudience", a)}
                    style={{
                      ...s.chipBtn,
                      background: form.targetAudience === a ? "linear-gradient(135deg, #d946ef, #fb923c)" : "#fdfaff",
                      color: form.targetAudience === a ? "#fff" : "#6b7280",
                      border: form.targetAudience === a ? "none" : "1px solid #f3e8ff",
                    }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Taken */}
            <div style={s.field}>
              <label style={s.label}>How long did it take to write?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TIME_OPTIONS.map(t => (
                  <button key={t} onClick={() => set("timeTaken", t)}
                    style={{
                      ...s.chipBtn,
                      background: form.timeTaken === t ? "linear-gradient(135deg, #d946ef, #fb923c)" : "#fdfaff",
                      color: form.timeTaken === t ? "#fff" : "#6b7280",
                      border: form.timeTaken === t ? "none" : "1px solid #f3e8ff",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={s.backBtn}>← Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.genre || !form.targetAudience || !form.timeTaken}
                style={{ ...s.nextBtn, flex: 1, opacity: form.genre && form.targetAudience && form.timeTaken ? 1 : 0.5 }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Experience */}
        {step === 3 && (
          <div>
            <h3 style={s.stepTitle}>⭐ Your Experience</h3>

            {/* Rating */}
            <div style={s.field}>
              <label style={s.label}>Rate your experience</label>
              <StarRating />
            </div>

            {/* Would Recommend */}
            <div style={s.field}>
              <label style={s.label}>Would you recommend Bookstagram?</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { val: "yes", label: "👍 Yes!" },
                  { val: "maybe", label: "🤔 Maybe" },
                  { val: "no", label: "👎 No" },
                ].map(({ val, label }) => (
                  <button key={val} onClick={() => set("wouldRecommend", val)}
                    style={{
                      ...s.optionBtn, flex: 1,
                      border: form.wouldRecommend === val ? "2px solid #d946ef" : "2px solid #f3e8ff",
                      background: form.wouldRecommend === val ? "linear-gradient(135deg, #fdf4ff, #fff7ed)" : "#fff",
                      color: form.wouldRecommend === val ? "#d946ef" : "#6b7280",
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} style={s.backBtn}>← Back</button>
              <button
                onClick={handleSubmit}
                disabled={!form.rating || !form.wouldRecommend || loading}
                style={{ ...s.nextBtn, flex: 1, opacity: form.rating && form.wouldRecommend ? 1 : 0.5 }}
              >
                {loading ? "Submitting..." : "Submit 🎉"}
              </button>
            </div>

            <button onClick={onClose} style={s.skipBtn}>Skip for now</button>
          </div>
        )}
      </div>
    </div>
  );
};

const s = {
  stepTitle: { fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16, marginTop: 0 },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 },
  input: {
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: "1.5px solid #f3e8ff", fontSize: 14,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  },
  optionBtn: {
    flex: 1, padding: "10px 0", borderRadius: 12, fontSize: 13,
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  chipBtn: {
    padding: "6px 14px", borderRadius: 20, fontSize: 12,
    fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
  },
  nextBtn: {
    width: "100%", padding: "14px 0", borderRadius: 12,
    background: "linear-gradient(135deg, #d946ef, #fb923c)",
    color: "#fff", border: "none", fontSize: 15,
    fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
  },
  backBtn: {
    padding: "14px 20px", borderRadius: 12,
    background: "#f3e8ff", color: "#d946ef",
    border: "none", fontSize: 14, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
  },
  skipBtn: {
    width: "100%", marginTop: 10, padding: "10px 0",
    background: "none", border: "none", color: "#9ca3af",
    fontSize: 13, cursor: "pointer", fontFamily: "inherit",
  },
};

export default SurveyModal;