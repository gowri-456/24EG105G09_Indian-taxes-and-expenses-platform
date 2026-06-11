import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50/20 p-4">
      <div className="text-center max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="text-2xl" />
        </div>
        <h1 className="text-[22px] font-bold text-gray-900">Page Not Found</h1>
        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-[13px] rounded-xl cursor-pointer shadow-lg shadow-blue-600/10 transition-colors"
        >
          <FiHome className="text-sm" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
