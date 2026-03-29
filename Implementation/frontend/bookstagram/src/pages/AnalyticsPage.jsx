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
    background: "#fff", borderRadius: 20, padding: "24px",
    border: "1px solid #f3e8ff", boxShadow: "0 4px 16px rgba(217,70,239,0.08)",
    display: "flex", alignItems: "center", gap: 18, flex: 1
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16, background: gradient,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 12px rgba(217,70,239,0.25)", flexShrink: 0
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  </div>
);

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => { fetchAnalytics(); }, []);

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
      [],
      ["Action", "Count"],
      ...data.mostUsedActions.map((a) => [a._id, a.count]),
      [],
      ["Date", "Activity Count"],
      ...data.last7DaysData.map((d) => [d._id, d.count]),
      [],
      ["User", "Email", "Actions"],
      ...data.userWiseActivity.map((u) => [u.name, u.email, u.count]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
  };

  if (loading) return (
    <NewDashboardLayout hideTopbar={true}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading analytics...</p>
        </div>
      </div>
    </NewDashboardLayout>
  );

  const chartData = (data.last7DaysData || []).map(d => ({ ...d, day: d._id?.slice(5) }));
  const actionData = (data.mostUsedActions || []).map(d => ({ ...d, name: d._id }));
  const genderChartData = (data.genderData || []).map(d => ({ name: d._id, value: d.count }));
  const ageChartData = data.ageData || [];

  return (
    <NewDashboardLayout hideTopbar={true}>
      <div style={{ padding: "28px 32px", background: "#fdfaff", minHeight: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>
              Analytics Dashboard
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>Admin only — platform insights</p>
          </div>
          <button onClick={exportCSV} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 12,
            background: "linear-gradient(135deg, #d946ef, #fb923c)",
            color: "#fff", border: "none", fontWeight: 700,
            fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>
            <Download size={16} /> Export CSV
          </button>
        </div>

        {/* Date Filter */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "16px 20px",
          border: "1px solid #f3e8ff", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>📅 Filter by date:</span>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid #f3e8ff", fontSize: 13, fontFamily: "inherit", outline: "none" }}
          />
          <span style={{ color: "#9ca3af", fontSize: 13 }}>to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid #f3e8ff", fontSize: 13, fontFamily: "inherit", outline: "none" }}
          />
          <button onClick={handleFilter} style={{
            padding: "8px 18px", borderRadius: 10, background: "linear-gradient(135deg, #d946ef, #fb923c)",
            color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>Apply</button>
          <button onClick={handleReset} style={{
            padding: "8px 18px", borderRadius: 10, background: "#f3e8ff",
            color: "#d946ef", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
          }}>Reset</button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard icon={<Users size={24} color="#fff" />} label="Total Users" value={data.totalUsers} gradient="linear-gradient(135deg, #d946ef, #fb923c)" />
          <StatCard icon={<BookOpen size={24} color="#fff" />} label="Total Books" value={data.totalBooks} gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
          <StatCard icon={<Activity size={24} color="#fff" />} label="Total Actions" value={data.totalActions} gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
          <StatCard icon={<TrendingUp size={24} color="#fff" />} label="Daily Active Users" value={data.dailyActiveUsers} gradient="linear-gradient(135deg, #10b981, #3b82f6)" />
        </div>

        {/* Line + Bar Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #f3e8ff" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 4 }}>📈 Last 7 Days Activity</h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 }}>Daily actions over the past week</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #f3e8ff", fontSize: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#d946ef" strokeWidth={3} dot={{ fill: "#d946ef", r: 5 }} activeDot={{ r: 7, fill: "#fb923c" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #f3e8ff" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 4 }}>🔥 Most Used Actions</h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 }}>Top actions performed by users</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={actionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #f3e8ff", fontSize: 12 }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {actionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

          {/* Gender Pie */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #f3e8ff" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 4 }}>👥 Gender Distribution</h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 }}>Male vs Female vs Other</p>
            {genderChartData.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>No gender data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Age Pie */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #f3e8ff" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 4 }}>🎂 Age Group Distribution</h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 }}>Users by age group</p>
            {ageChartData.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>No age data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={ageChartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {ageChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Most Active Users */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #f3e8ff" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: 4 }}> Most Active Users</h2>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 }}>Users with highest activity</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.userWiseActivity.map((u, i) => (
              <div key={u._id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 18px", background: "#fdfaff",
                borderRadius: 14, border: "1px solid #f3e8ff"
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: i === 0 ? "linear-gradient(135deg, #f59e0b, #ef4444)" : i === 1 ? "linear-gradient(135deg, #9ca3af, #6b7280)" : "linear-gradient(135deg, #fb923c, #f59e0b)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 11, fontWeight: 800, flexShrink: 0
                }}>{i + 1}</div>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #d946ef, #fb923c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 15, fontWeight: 700, overflow: "hidden", flexShrink: 0
                }}>
                  {u.avatar
                    ? <img src={u.avatar.startsWith("http") ? u.avatar : `${BASE_URL}${u.avatar}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.style.display = "none"} />
                    : u.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.email}</div>
                </div>
                <div style={{
                  background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
                  border: "1px solid #f3e8ff", borderRadius: 20,
                  padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "#d946ef"
                }}>{u.count} actions</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </NewDashboardLayout>
  );
};

export default AnalyticsPage;