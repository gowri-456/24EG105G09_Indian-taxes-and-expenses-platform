import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FiGrid,
  FiTrendingUp,
  FiTrendingDown,
  FiCreditCard,
  FiFileText,
  FiBarChart2,
  FiUser,
  FiLogOut,
  FiChevronUp,
  FiCpu,
} from "react-icons/fi";

const MAIN_NAV = [
  {
    label: "Dashboard",
    icon: <FiGrid />,
    path: "/dashboard",
  },
  {
    label: "Expenses",
    icon: <FiTrendingDown />,
    path: "/expenses",
    badge: { value: 3, type: "danger" },
  },
  {
    label: "Income",
    icon: <FiTrendingUp />,
    path: "/income",
  },
];

const PLANNING_NAV = [
  {
    label: "Budget Planner",
    icon: <FiCreditCard />,
    path: "/budget-planner",
    badge: { value: "!", type: "warn" },
  },
  {
    label: "Tax Calculator",
    icon: <FiFileText />,
    path: "/tax-calculator",
  },
  {
    label: "Reports",
    icon: <FiBarChart2 />,
    path: "/reports",
  },
  {
    label: "AI Coach",
    icon: <FiCpu />,
    path: "/advisor",
    badge: { value: "New", type: "warn" },
  },
];

const ACCOUNT_NAV = [
  { label: "Profile", icon: <FiUser />, path: "/profile" },
];

function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors duration-150 mb-0.5 ${
          isActive
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-500 hover:bg-blue-50 hover:text-gray-800"
        }`
      }
    >
      <span className="text-base shrink-0">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            item.badge.type === "danger"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-755"
          }`}
        >
          {item.badge.value}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <aside className="w-52.5 shrink-0 bg-white border-r border-gray-100 flex flex-col py-4 overflow-y-auto">
      {/* Main Section */}
      <div className="px-3 mb-1">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-2 mb-1">
          Main
        </p>
        {MAIN_NAV.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      <div className="mx-3 my-2 border-t border-gray-100" />

      {/* Planning Section */}
      <div className="px-3 mb-1">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-2 mb-1">
          Planning
        </p>
        {PLANNING_NAV.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      <div className="mx-3 my-2 border-t border-gray-100" />

      {/* Account Section */}
      <div className="px-3 mb-1">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest px-2 mb-1">
          Account
        </p>
        {ACCOUNT_NAV.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] text-red-500 hover:bg-red-50 transition-colors duration-150 mb-0.5"
        >
          <FiLogOut className="text-base shrink-0" />
          <span>Logout</span>
        </button>
      </div>

      {/* User Card at Bottom */}
      <div className="mt-auto px-3">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 bg-blue-50/60 cursor-pointer hover:bg-blue-100/60 transition-colors">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
            {getInitials(user?.name || "Arjun Kumar")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-gray-900 truncate">
              {user?.name || "Arjun"}
            </p>
            <p className="text-[11px] text-gray-500">Free Plan</p>
          </div>
          <FiChevronUp className="text-gray-400 text-sm shrink-0" />
        </div>
      </div>
    </aside>
  );
}
