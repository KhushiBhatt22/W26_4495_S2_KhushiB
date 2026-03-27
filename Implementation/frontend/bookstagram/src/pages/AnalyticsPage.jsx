import { useState, useEffect } from "react";
import { Users, BookOpen, Activity, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from "recharts";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import NewDashboardLayout from "../components/layout/NewDashboardLayout";

const BASE_URL = "http://localhost:8000";

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

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.ANALYTICS.DASHBOARD);
      setData(res.data);
    } catch {
      console.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
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

  // Format dates for chart to be shorter
  const chartData = (data.last7DaysData || []).map(d => ({
    ...d,
    day: d._id?.slice(5), // shows MM-DD instead of full date
  }));

  const actionData = (data.mostUsedActions || []).map(d => ({
    ...d,
    name: d._id,
  }));

  return (
    <NewDashboardLayout hideTopbar={true}>
      <div style={{ padding: "28px 32px", background: "#fdfaff", minHeight: "100%" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>
            📊 Analytics Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
            Track your platform's growth and user activity
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <StatCard
            icon={<Users size={24} color="#fff" />}
            label="Total Users"
            value={data.totalUsers}
            gradient="linear-gradient(135deg, #d946ef, #fb923c)"
          />
          <StatCard
            icon={<BookOpen size={24} color="#fff" />}
            label="Total Books"
            value={data.totalBooks}
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
          />
          <StatCard
            icon={<Activity size={24} color="#fff" />}
            label="Total Actions"
            value={data.totalActions}
            gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
          />
          <StatCard
            icon={<TrendingUp size={24} color="#fff" />}
            label="Daily Active Users"
            value={data.dailyActiveUsers}
            gradient="linear-gradient(135deg, #10b981, #3b82f6)"
          />
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

          {/* Last 7 Days */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f3e8ff", boxShadow: "0 4px 16px rgba(217,70,239,0.06)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8, marginTop: 0 }}>
              📈 Last 7 Days Activity
            </h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 }}>Daily user actions over the past week</p>
            {chartData.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                No activity data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "1px solid #f3e8ff", fontSize: 12 }}
                  />
                  <Line
                    type="monotone" dataKey="count" stroke="#d946ef"
                    strokeWidth={3} dot={{ fill: "#d946ef", r: 5 }}
                    activeDot={{ r: 7, fill: "#fb923c" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Most Used Actions */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f3e8ff", boxShadow: "0 4px 16px rgba(217,70,239,0.06)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8, marginTop: 0 }}>
              🔥 Most Used Actions
            </h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 }}>Top actions performed by users</p>
            {actionData.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
                No action data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={actionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "1px solid #f3e8ff", fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}
                    fill="url(#barGradient)"
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d946ef" />
                      <stop offset="100%" stopColor="#fb923c" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Most Active Users */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "24px", border: "1px solid #f3e8ff", boxShadow: "0 4px 16px rgba(217,70,239,0.06)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 8, marginTop: 0 }}>
            👑 Most Active Users
          </h2>
          <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 20, marginTop: 0 }}>Users with the highest activity on the platform</p>

          {data.userWiseActivity.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              No user activity yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.userWiseActivity.map((u, i) => (
                <div key={u._id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px", background: "#fdfaff",
                  borderRadius: 14, border: "1px solid #f3e8ff"
                }}>
                  {/* Rank */}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: i === 0 ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                      : i === 1 ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                      : "linear-gradient(135deg, #fb923c, #f59e0b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 11, fontWeight: 800, flexShrink: 0
                  }}>
                    {i + 1}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "linear-gradient(135deg, #d946ef, #fb923c)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 15, fontWeight: 700,
                    overflow: "hidden", flexShrink: 0
                  }}>
                    {u.avatar
                      ? <img src={u.avatar.startsWith("http") ? u.avatar : `${BASE_URL}${u.avatar}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => e.target.style.display = "none"} />
                      : u.name?.charAt(0).toUpperCase()
                    }
                  </div>

                  {/* Name + email */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.email}</div>
                  </div>

                  {/* Action count badge */}
                  <div style={{
                    background: "linear-gradient(135deg, #fdf4ff, #fff7ed)",
                    border: "1px solid #f3e8ff", borderRadius: 20,
                    padding: "6px 14px", fontSize: 13, fontWeight: 700, color: "#d946ef"
                  }}>
                    {u.count} actions
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </NewDashboardLayout>
  );
};

export default AnalyticsPage;