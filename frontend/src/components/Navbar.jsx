import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiShield,
} from "react-icons/fi";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

const NAV_LINKS = [
  { label: "Overview", path: "/dashboard" },
  { label: "Transactions", path: "/expenses" },
  { label: "Tax", path: "/tax-calculator" },
  { label: "Reports", path: "/reports" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 z-50 relative">
      {/* Logo */}
      <Link to="/dashboard" className="flex items-center gap-2 select-none">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <MdOutlineAccountBalanceWallet className="text-white text-lg" />
        </div>
        <span className="text-[15px] font-medium text-gray-900">
          Fin<span className="text-blue-600">Track</span> India
        </span>
      </Link>

      {/* Center Nav */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            onClick={() => setActiveNav(link.label)}
            className={`text-[13px] px-3 py-1.5 rounded-full transition-colors duration-150 ${
              activeNav === link.label
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-500 hover:bg-blue-50 hover:text-gray-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Removed Search, Notifications, and Settings icons */}

        {/* Profile Dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
              {getInitials(user?.name || "Arjun Kumar")}
            </div>
            <FiChevronDown className="text-gray-400 text-sm" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "Arjun Kumar"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "arjun@example.com"}
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
              >
                <FiUser className="text-gray-400" />
                Profile
              </Link>
              {user?.role === "admin" && (
                <>
                  <div className="border-t border-gray-100 my-1"></div>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 transition-colors font-medium"
                  >
                    <FiShield className="text-purple-500" />
                    Admin Panel
                  </Link>
                </>
              )}
              {/* Settings link removed */}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut className="text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}