import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import EditorPage from "./pages/EditorPage";
import NewDashboardPage from "./pages/NewDashboardPage";
import HomePage from "./pages/HomePage";
import ViewBookPage from "./pages/ViewBookPage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";
import ThreadsPage from "./pages/ThreadsPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";

const App = () => {
  return (
    <div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        {/* <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} /> */}
        <Route path="/newdashboard" element={<ProtectedRoute><NewDashboardPage /></ProtectedRoute>} />
        <Route path="/editor/:bookId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
        <Route path="/view-book/:bookId" element={<ProtectedRoute><ViewBookPage /></ProtectedRoute>} />

        {/* Profile — own profile (no userId) OR another user's profile */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
        <Route path="/threads" element={<ProtectedRoute><ThreadsPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
};

export default App;