import { Link, useLocation } from "react-router-dom";
import { FiBarChart2, FiUsers, FiShield, FiHome } from "react-icons/fi";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

const ADMIN_LINKS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: FiHome },
  { label: "Users", path: "/admin/users", icon: FiUsers },
  { label: "Analytics", path: "/admin/analytics", icon: FiBarChart2 },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Logo */}
      <Link to="/admin/dashboard" className="flex items-center gap-2 p-5 hover:bg-gray-50 transition-colors">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <MdOutlineAccountBalanceWallet className="text-white text-lg" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">FinTrack</p>
          <p className="text-xs text-purple-600 font-semibold">Admin</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className={`text-lg ${isActive ? "text-blue-600" : "text-gray-400"}`} />
              <span className="text-sm">{link.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
            </Link>
          );
        })}
      </nav>

      {/* Admin Badge */}
      <div className="p-4 border-t border-gray-100 bg-blue-50 rounded-lg m-3">
        <div className="flex items-center gap-2 mb-2">
          <FiShield className="text-blue-600 text-lg" />
          <p className="text-xs font-bold text-gray-700">Admin Panel</p>
        </div>
        <p className="text-xs text-gray-600">You have full platform access</p>
      </div>
    </aside>
  );
}
