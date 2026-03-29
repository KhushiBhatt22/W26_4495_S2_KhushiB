import { useState, useEffect } from "react";
import { Users, BookOpen, Activity, TrendingUp, Download } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";

const BASE_URL = "http://localhost:8000";
const COLORS = ["#d946ef", "#fb923c", "#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const StatCard = ({ icon, label, value, gradient }) => (
  <div style={{
    background: "#fff", borderRadius: 16, padding: "20px 24px",
    border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex", alignItems: "center", gap: 16, flex: 1
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: 14, background: gradient,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

// Clean progress bar row
const ProgressRow = ({ label, count, total, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "capitalize" }}>{label}</span>
      <span style={{ fontSize: 12, color: "#6b7280" }}>{count} <span style={{ color: "#9ca3af" }}>({Math.round((count / total) * 100)}%)</span></span>
    </div>
    <div style={{ height: 6, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 6, background: color,
        width: `${(count / total) * 100}%`, transition: "width 0.5s ease"
      }} />
    </div>
  </div>
);

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [surveyData, setSurveyData] = useState(null);

  useEffect(() => { fetchAnalytics(); fetchSurveyAnalytics(); }, []);

  const fetchAnalytics = async (fromDate = "", toDate = "") => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await axiosInstance.get(API_PATHS.ANALYTICS.DASHBOARD, { params });
      setData(res.data);
    } catch {
      console.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyAnalytics = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.SURVEY.ANALYTICS);
      setSurveyData(res.data);
    } catch {
      console.error("No survey data");
    }
  };

  const handleFilter = () => fetchAnalytics(from, to);
  const handleReset = () => { setFrom(""); setTo(""); fetchAnalytics(); };

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Users", data.totalUsers],
      ["Total Books", data.totalBooks],
      ["Total Actions", data.totalActions],
      ["Daily Active Users", data.dailyActiveUsers],
      [], ["Action", "Count"],
      ...data.mostUsedActions.map((a) => [a._id, a.count]),
      [], ["Date", "Activity Count"],
      ...data.last7DaysData.map((d) => [d._id, d.count]),
      [], ["User", "Email", "Actions"],
      ...data.userWiseActivity.map((u) => [u.name, u.email, u.count]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "analytics.csv"; a.click();
  };

  if (loading) return (
    <NewDashboardLayout hideTopbar={true}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading analytics...</p>
        </div>
      </div>
    </NewDashboardLayout>
  );

  const chartData = (data.last7DaysData || []).map(d => ({ ...d, day: d._id?.slice(5) }));
  const actionData = (data.mostUsedActions || []).map(d => ({ ...d, name: d._id }));
  const genderChartData = (surveyData?.genderData || []).map(d => ({ name: d._id, value: d.count }));
  const ageChartData = surveyData?.ageData || [];

  const section = {
    background: "#fff", borderRadius: 16, padding: 24,
    border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
  };

  const sectionTitle = { fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 4 };
  const sectionSub = { fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 };

  return (
    <NewDashboardLayout hideTopbar={true}>
      <div style={{ padding: "28px 32px", background: "#f9fafb", minHeight: "100%", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Analytics Dashboard</h1>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Admin only — platform insights</p>
          </div>
          <button onClick={exportCSV} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
            borderRadius: 10, background: "#111827", color: "#fff",
            border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Date Filter */}
        <div style={{
          ...section, marginBottom: 24, padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Filter by date</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#374151" }}
          />
          <span style={{ color: "#9ca3af", fontSize: 13 }}>→</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#374151" }}
          />
          <button onClick={handleFilter} style={{
            padding: "7px 16px", borderRadius: 8, background: "#111827",
            color: "#fff", border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
          }}>Apply</button>
          <button onClick={handleReset} style={{
            padding: "7px 16px", borderRadius: 8, background: "#f3f4f6",
            color: "#374151", border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
          }}>Reset</button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard icon={<Users size={22} color="#fff" />} label="Total Users" value={data.totalUsers} gradient="linear-gradient(135deg, #d946ef, #fb923c)" />
          <StatCard icon={<BookOpen size={22} color="#fff" />} label="Total Books" value={data.totalBooks} gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
          <StatCard icon={<Activity size={22} color="#fff" />} label="Total Actions" value={data.totalActions} gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
          <StatCard icon={<TrendingUp size={22} color="#fff" />} label="Daily Active Users" value={data.dailyActiveUsers} gradient="linear-gradient(135deg, #10b981, #3b82f6)" />
        </div>

        {/* Line + Bar Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div style={section}>
            <h2 style={sectionTitle}>Last 7 Days Activity</h2>
            <p style={sectionSub}>Daily user actions over the past week</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                <Line type="monotone" dataKey="count" stroke="#d946ef" strokeWidth={2.5} dot={{ fill: "#d946ef", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: "#fb923c" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={section}>
            <h2 style={sectionTitle}>Most Used Actions</h2>
            <p style={sectionSub}>Top actions performed by users</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={actionData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {actionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Gender */}
          <div style={section}>
            <h2 style={sectionTitle}>Gender Distribution</h2>
            <p style={sectionSub}>Based on survey responses</p>
            {genderChartData.length === 0 ? (
              <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>👥</span>
                No gender data yet
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={genderChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                      {genderChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {genderChartData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#374151", textTransform: "capitalize", flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{Math.round((d.value / genderChartData.reduce((a, b) => a + b.value, 0)) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Age */}
          <div style={section}>
            <h2 style={sectionTitle}>Age Group Distribution</h2>
            <p style={sectionSub}>Based on survey responses</p>
            {ageChartData.length === 0 ? (
              <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                <span style={{ fontSize: 32, marginBottom: 8 }}>🎂</span>
                No age data yet
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={ageChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                      {ageChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {ageChartData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Most Active Users */}
        <div style={{ ...section, marginBottom: 20 }}>
          <h2 style={sectionTitle}>Most Active Users</h2>
          <p style={sectionSub}>Users with highest activity on the platform</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.userWiseActivity.map((u, i) => (
              <div key={u._id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", background: i === 0 ? "#fdfaff" : "#fff",
                borderRadius: 12, border: "1px solid #f3f4f6"
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : "#e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: i < 2 ? "#fff" : "#6b7280", fontSize: 11, fontWeight: 800,
                }}>{i + 1}</div>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #d946ef, #fb923c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 14, fontWeight: 700, overflow: "hidden",
                }}>
                  {u.avatar
                    ? <img src={u.avatar.startsWith("http") ? u.avatar : `${BASE_URL}${u.avatar}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.style.display = "none"} />
                    : u.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{u.email}</div>
                </div>
                <div style={{
                  background: "#f9fafb", border: "1px solid #e5e7eb",
                  borderRadius: 20, padding: "5px 12px",
                  fontSize: 12, fontWeight: 700, color: "#374151"
                }}>{u.count} actions</div>
              </div>
            ))}
          </div>
        </div>

        {/* Survey Results */}
        {surveyData && surveyData.totalSurveys > 0 && (
          <div style={section}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <h2 style={{ ...sectionTitle, margin: 0 }}>Survey Results</h2>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "4px 10px", borderRadius: 20 }}>
                {surveyData.totalSurveys} responses
              </span>
            </div>
            <p style={sectionSub}>Collected from authors after book creation</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

              {/* Genre */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14, marginTop: 0 }}>Popular Genres</h3>
                {surveyData.genreData.map((g, i) => (
                  <ProgressRow key={i} label={g._id} count={g.count} total={surveyData.totalSurveys} color={COLORS[i % COLORS.length]} />
                ))}
              </div>

              {/* Recommend */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14, marginTop: 0 }}>Would Recommend?</h3>
                {surveyData.recommendData.map((r, i) => (
                  <ProgressRow key={i} label={r._id} count={r.count} total={surveyData.totalSurveys}
                    color={r._id === "yes" ? "#10b981" : r._id === "maybe" ? "#f59e0b" : "#ef4444"} />
                ))}
              </div>

              {/* Rating */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14, marginTop: 0 }}>Ratings</h3>
                {surveyData.ratingData.map((r, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#374151" }}>
                        {"★".repeat(r._id)}{"☆".repeat(5 - r._id)}
                        <span style={{ marginLeft: 6, color: "#9ca3af" }}>{r._id} star{r._id > 1 ? "s" : ""}</span>
                      </span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{r.count} <span style={{ color: "#9ca3af" }}>({Math.round((r.count / surveyData.totalSurveys) * 100)}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: "#f3f4f6", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 6,
                        background: r._id >= 4 ? "#10b981" : r._id === 3 ? "#f59e0b" : "#ef4444",
                        width: `${(r.count / surveyData.totalSurveys) * 100}%`
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Audience */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14, marginTop: 0 }}>Target Audience</h3>
                {surveyData.audienceData.map((a, i) => (
                  <ProgressRow key={i} label={a._id} count={a.count} total={surveyData.totalSurveys} color={COLORS[i % COLORS.length]} />
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </NewDashboardLayout>
  );
};

export default AnalyticsPage;