import { useState, useEffect } from "react";
import { FiBarChart2, FiPieChart, FiTrendingUp, FiCalendar } from "react-icons/fi";

export default function AdminAnalytics() {
  const [timeframe, setTimeframe] = useState("monthly");
  const [analyticsData] = useState({
    userGrowth: [
      { month: "Jan", users: 50 },
      { month: "Feb", users: 120 },
      { month: "Mar", users: 180 },
      { month: "Apr", users: 245 },
    ],
    taxRegimeUsage: {
      oldRegime: 35,
      newRegime: 65,
    },
    expenseCategories: {
      savings: 45,
      healthcare: 20,
      home: 20,
      travel: 15,
    },
  });

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Platform usage and trends</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
          <button
            onClick={() => setTimeframe("weekly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeframe === "weekly"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe("monthly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeframe === "monthly"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe("yearly")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeframe === "yearly"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">User Growth</h2>
            <FiTrendingUp className="text-green-600 text-xl" />
          </div>
          <div className="space-y-4">
            {analyticsData.userGrowth.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">{item.month}</span>
                  <span className="text-sm font-bold text-gray-900">{item.users} users</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(item.users / 245) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax Regime Usage */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Tax Regime Usage</h2>
            <FiPieChart className="text-purple-600 text-xl" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">New Tax System</span>
                <span className="text-sm font-bold text-gray-900">{analyticsData.taxRegimeUsage.newRegime}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${analyticsData.taxRegimeUsage.newRegime}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Old Tax System</span>
                <span className="text-sm font-bold text-gray-900">{analyticsData.taxRegimeUsage.oldRegime}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${analyticsData.taxRegimeUsage.oldRegime}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Top Expense Categories</h2>
          <FiBarChart2 className="text-orange-600 text-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(analyticsData.expenseCategories).map(([category, percentage]) => (
            <div key={category} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-600 capitalize mb-2">{category}</p>
              <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full`}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor:
                      category === "savings"
                        ? "#10b981"
                        : category === "healthcare"
                        ? "#f59e0b"
                        : category === "home"
                        ? "#3b82f6"
                        : "#ec4899",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Avg. Tax Saved Per User</p>
          <p className="text-3xl font-bold text-green-700">₹21,224</p>
          <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Active Users This Month</p>
          <p className="text-3xl font-bold text-blue-700">189</p>
          <p className="text-xs text-blue-600 mt-2">↑ 15% engagement</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Avg. Expenses Tracked</p>
          <p className="text-3xl font-bold text-purple-700">43.2</p>
          <p className="text-xs text-purple-600 mt-2">Per user per month</p>
        </div>
      </div>
    </div>
  );
}
