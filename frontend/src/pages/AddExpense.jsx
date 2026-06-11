import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { expenseService } from "../services/expenseService";
import { toast } from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

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
];

const PAYMENT_MODES = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking", "Other"];

export default function AddExpense() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[1]);
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await expenseService.addExpense({
        title,
        amount: Number(amount),
        category,
        date,
        description,
        paymentMode,
        isTaxDeductible,
      });
      toast.success("Expense added successfully");
      navigate("/expenses");
    } catch (err) {
      toast.error(err.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto max-w-xl mx-auto">
      {/* Back link */}
      <div className="mb-4">
        <Link to="/expenses" className="inline-flex items-center gap-1 text-[12px] text-blue-600 hover:underline">
          <FiArrowLeft /> Back to list
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-[18px] font-semibold text-gray-900 mb-5">Log New Expense</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Uber ride to office"
              className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="450"
                min="0.01"
                step="any"
                className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category & Payment Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-[13px] px-2 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Payment Mode *</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full text-[13px] px-2 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              >
                {PAYMENT_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional expense details..."
              rows="3"
              className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Tax Saving Switch */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isTaxDeductiblePage"
              checked={isTaxDeductible}
              onChange={(e) => setIsTaxDeductible(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isTaxDeductiblePage" className="text-[12px] text-gray-700 cursor-pointer select-none">
              This expense is tax deductible (Section 80C, 80D, HRA, etc.)
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-55">
            <Link
              to="/expenses"
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-[12px] font-medium rounded-lg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-medium rounded-lg shadow-lg shadow-blue-600/10 cursor-pointer"
            >
              {submitting ? "Saving..." : "Log Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
