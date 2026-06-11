import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FiArrowRight,
  FiTrendingUp,
  FiFileText,
  FiPercent,
  FiLock,
  FiShield,
} from "react-icons/fi";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MdOutlineAccountBalanceWallet className="text-white text-lg" />
          </div>
          <span className="text-[15px] font-semibold text-gray-900">
            Fin<span className="text-blue-600">Track</span> India
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="text-[13px] font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md shadow-blue-600/10"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13px] font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-[13px] font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md shadow-blue-600/10"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-semibold uppercase tracking-wider mb-6">
            <FiShield className="text-[12px]" /> Made for Indian Taxpayers
          </div>
          
          <h1 className="text-[42px] font-bold text-gray-900 leading-tight tracking-tight max-w-3xl mx-auto">
            Take Control of Your <span className="text-blue-600">Expenses</span> & Compare <span className="text-indigo-600">Tax Regimes</span> Effortlessly
          </h1>
          
          <p className="text-[15px] text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
            The modern financial assistant that tracks your daily logs, schedules budgets, and computes your Indian tax liabilities under both Old and New Slabs for FY 2024-25.
          </p>

          <div className="flex justify-center gap-3 mt-8">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="flex items-center gap-2 text-[13px] font-semibold px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/15"
            >
              Plan Your Taxes Now
              <FiArrowRight />
            </Link>
            <Link
              to="/login"
              className="text-[13px] font-semibold px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="bg-white border-t border-gray-150 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-[22px] font-bold text-gray-900 text-center mb-10">
              Why use FinTrack India?
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                <span className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <FiTrendingUp className="text-lg" />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">Expense Tracking</h3>
                <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                  Log your daily utility bills, shopping, rents, and investments. Filter by category, dates, and search easily.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <FiPercent className="text-lg" />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">Tax Regime Comparison</h3>
                <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                  Provide your HRA, 80C, 80D, and NPS deductions. Find the best regime (Old vs New Slabs) based on Indian Tax laws.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                <span className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <FiFileText className="text-lg" />
                </span>
                <h3 className="text-[14px] font-bold text-gray-900">Budget Thresholds</h3>
                <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                  Configure monthly spending limits for categories. Receive warning alerts when you cross defined thresholds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-gray-150 flex items-center justify-between px-8 text-[11px] text-gray-400 bg-white">
        <span>© {new Date().getFullYear()} FinTrack India. All rights reserved.</span>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-blue-500">Privacy Policy</Link>
          <Link to="/" className="hover:text-blue-500">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
