import { useState, useEffect } from "react";
import { budgetService } from "../services/budgetService";
import { toast } from "react-hot-toast";
import {
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiTrendingDown,
  FiSliders,
} from "react-icons/fi";

const CATEGORIES = [
  "Food & Dining",
  "Travel & Transport",
  "Shopping",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Entertainment",
  "Rent",
  "EMI",
  "Investments",
  "Other",
  "Total",
];

const MONTHS = [
  { val: 1, name: "January" },
  { val: 2, name: "February" },
  { val: 3, name: "March" },
  { val: 4, name: "April" },
  { val: 5, name: "May" },
  { val: 6, name: "June" },
  { val: 7, name: "July" },
  { val: 8, name: "August" },
  { val: 9, name: "September" },
  { val: 10, name: "October" },
  { val: 11, name: "November" },
  { val: 12, name: "December" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BudgetPlanner() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Month & Year state
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("80");
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await budgetService.getBudgets(month, year);
      setBudgets(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleOpenAddModal = () => {
    setCategory(CATEGORIES[0]);
    setMonthlyLimit("");
    setAlertThreshold("80");
    setModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!category || !monthlyLimit) {
      toast.error("Please enter a budget limit");
      return;
    }

    setSubmitting(true);
    try {
      await budgetService.setBudget({
        category,
        monthlyLimit: Number(monthlyLimit),
        month: Number(month),
        year: Number(year),
        alertThreshold: Number(alertThreshold),
      });
      toast.success("Budget set successfully!");
      setModalOpen(false);
      fetchBudgets();
    } catch (err) {
      toast.error(err.message || "Failed to save budget");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget limit?")) return;
    try {
      await budgetService.deleteBudget(id);
      toast.success("Budget deleted");
      fetchBudgets();
    } catch (err) {
      toast.error(err.message || "Failed to delete budget");
    }
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">Budget Planner</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Set and track monthly limits for your expense categories.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/15 cursor-pointer"
        >
          <FiPlus className="text-sm" />
          Set Budget Limit
        </button>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiSliders className="text-blue-500" />
          <span className="text-[13px] font-medium text-gray-700">Active Budget Period:</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="text-[12px] px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
          >
            {MONTHS.map((m) => (
              <option key={m.val} value={m.val}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-[12px] px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Budget Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[12px] text-gray-400 mt-2">Loading active budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white border border-gray-100 rounded-xl">
          <FiTrendingDown className="text-gray-300 text-4xl mb-2" />
          <p className="text-[14px] text-gray-600 font-medium">No budgets defined for this month</p>
          <p className="text-[12px] text-gray-400 mt-1">
            Setting limits alerts you when you spend too much.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-3 py-1.5 text-[12px] font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
          >
            Create First Limit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {budgets.map((b) => {
            const isOver = b.isOverBudget;
            const isNear = b.isNearLimit;
            let statusColor = "bg-green-500";
            let statusBg = "bg-green-50/50 border-green-100";
            let statusText = "text-green-700";

            if (isOver) {
              statusColor = "bg-red-500";
              statusBg = "bg-red-50/50 border-red-100";
              statusText = "text-red-700";
            } else if (isNear) {
              statusColor = "bg-amber-500";
              statusBg = "bg-amber-50/50 border-amber-100";
              statusText = "text-amber-700";
            }

            return (
              <div
                key={b._id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md ${statusBg}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[14px] font-semibold text-gray-900">{b.category}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Alert limit: {b.alertThreshold}%</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBudget(b._id)}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>

                {/* Spent vs Limit */}
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[16px] font-bold text-gray-900">{formatCurrency(b.spent)}</span>
                  <span className="text-[12px] text-gray-500">of {formatCurrency(b.monthlyLimit)} limit</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${statusColor} rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(100, b.usedPercent)}%` }}
                  />
                </div>

                {/* Status info */}
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  {isOver ? (
                    <>
                      <FiAlertTriangle className="text-red-500 text-sm" />
                      <span className="text-red-600">
                        Over Budget by {formatCurrency(b.spent - b.monthlyLimit)} ({b.usedPercent}% used)
                      </span>
                    </>
                  ) : isNear ? (
                    <>
                      <FiAlertTriangle className="text-amber-500 text-sm" />
                      <span className="text-amber-600">
                        Approaching Limit ({b.usedPercent}% used)
                      </span>
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="text-green-500 text-sm" />
                      <span className="text-green-600">
                        On Track ({b.usedPercent}% used, {formatCurrency(b.remaining)} left)
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm border border-gray-100 shadow-2xl p-6">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-4">Set Category Budget</h2>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-[13px] px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Monthly Limit */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Monthly Limit (₹) *</label>
                <input
                  type="number"
                  required
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="e.g. 15000"
                  min="1"
                  className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              {/* Alert Threshold */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Alert Threshold: {alertThreshold}% of limit
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {["70", "90", "100"].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAlertThreshold(value)}
                      className={`rounded-lg border px-2 py-1.5 text-[11px] font-semibold ${
                        alertThreshold === value
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {value}% alert
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-[12px] font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-medium rounded-lg cursor-pointer"
                >
                  {submitting ? "Saving..." : "Set Limit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
