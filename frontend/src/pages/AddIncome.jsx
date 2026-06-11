import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { incomeService } from "../services/incomeService";
import { toast } from "react-hot-toast";
import { FiArrowLeft } from "react-icons/fi";

const SOURCES = [
  "Salary",
  "Freelancing",
  "Business",
  "Rental Income",
  "Investments",
  "Interest",
  "Dividends",
  "Capital Gains",
  "Gift",
  "Other",
];

const FINANCIAL_YEARS = ["2024-25", "2025-26", "2023-24"];

export default function AddIncome() {
  const navigate = useNavigate();
  const [source, setSource] = useState(SOURCES[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [financialYear, setFinancialYear] = useState(FINANCIAL_YEARS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !amount || !date || !financialYear) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await incomeService.addIncome({
        source,
        amount: Number(amount),
        date,
        description,
        isRecurring,
        financialYear,
      });
      toast.success("Income record added successfully");
      navigate("/income");
    } catch (err) {
      toast.error(err.message || "Failed to add income record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto max-w-xl mx-auto">
      {/* Back link */}
      <div className="mb-4">
        <Link to="/income" className="inline-flex items-center gap-1 text-[12px] text-blue-600 hover:underline">
          <FiArrowLeft /> Back to ledger
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h1 className="text-[18px] font-semibold text-gray-900 mb-5">Add Income Stream</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source & Financial Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Source *</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full text-[13px] px-2 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              >
                {SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Financial Year *</label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full text-[13px] px-2 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              >
                {FINANCIAL_YEARS.map((fy) => (
                  <option key={fy} value={fy}>
                    {fy}
                  </option>
                ))}
              </select>
            </div>
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
                placeholder="60000"
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

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly salary payout"
              rows="3"
              className="w-full text-[13px] px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Recurring Switch */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="isRecurringPage"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isRecurringPage" className="text-[12px] text-gray-700 cursor-pointer select-none">
              This is a recurring monthly income stream
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-55">
            <Link
              to="/income"
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-[12px] font-medium rounded-lg"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-medium rounded-lg shadow-lg shadow-blue-600/10 cursor-pointer"
            >
              {submitting ? "Saving..." : "Log Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
