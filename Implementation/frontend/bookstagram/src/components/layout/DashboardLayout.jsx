import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProfileDropdown from "./ProfileDropdown";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => {
      if (profileDropdownOpen) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {/* <Link className="flex items-center space-x-3" to="/dashboard">
              <div className="h-9 w-9 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>

              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent tracking-tight">
                Bookstagram
              </span>
            </Link>  */}
            {/* Center — logo */}
                      <Link to="/newdashboard" className="flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
                        <div className="h-8 w-8 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent tracking-tight">
                          Bookstagram
                        </span>
                      </Link>
          </div>

          <div className="flex items-center space-x-3">
            <ProfileDropdown
              isOpen={profileDropdownOpen}
              onToggle={(e) => {
                e.stopPropagation();
                setProfileDropdownOpen(!profileDropdownOpen);
              }}
              avatar={user?.avatar || ""}
              companyName={user?.name || ""}
              email={user?.email || ""}
              onLogout={logout}
            />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
