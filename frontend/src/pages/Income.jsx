import { useState, useEffect } from "react";
import { incomeService } from "../services/incomeService";
import { toast } from "react-hot-toast";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiTrendingUp,
  FiTag,
  FiCalendar,
} from "react-icons/fi";

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

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [sourceFilter, setSourceFilter] = useState("");
  const [financialYearFilter, setFinancialYearFilter] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  // Form states
  const [source, setSource] = useState(SOURCES[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [financialYear, setFinancialYear] = useState(FINANCIAL_YEARS[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        limit: 10,
        source: sourceFilter,
        financialYear: financialYearFilter,
      };

      const res = await incomeService.getIncome(filters);
      setIncomes(res.data || []);
      setTotal(res.total || 0);
      setTotalAmount(res.totalAmount || 0);
      setPages(res.pages || 1);
    } catch (err) {
      toast.error(err.message || "Failed to load income records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [page, sourceFilter, financialYearFilter]);

  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setSource(SOURCES[0]);
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setIsRecurring(false);
    setFinancialYear(FINANCIAL_YEARS[0]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (income) => {
    setEditingIncome(income);
    setSource(income.source);
    setAmount(income.amount);
    setDate(new Date(income.date).toISOString().split("T")[0]);
    setDescription(income.description || "");
    setIsRecurring(income.isRecurring || false);
    setFinancialYear(income.financialYear || FINANCIAL_YEARS[0]);
    setModalOpen(true);
  };

  const handleSaveIncome = async (e) => {
    e.preventDefault();
    if (!source || !amount || !date || !financialYear) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    const payload = {
      source,
      amount: Number(amount),
      date,
      description,
      isRecurring,
      financialYear,
    };

    try {
      if (editingIncome) {
        await incomeService.updateIncome(editingIncome._id, payload);
        toast.success("Income record updated successfully");
      } else {
        await incomeService.addIncome(payload);
        toast.success("Income record added successfully");
      }
      setModalOpen(false);
      fetchIncome();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income record?")) return;
    try {
      await incomeService.deleteIncome(id);
      toast.success("Income record deleted");
      fetchIncome();
    } catch (err) {
      toast.error(err.message || "Failed to delete income record");
    }
  };

  const clearFilters = () => {
    setSourceFilter("");
    setFinancialYearFilter("");
    setPage(1);
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">Income Ledger</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Log and review your revenue sources. Aggregate total:{" "}
            <span className="font-semibold text-emerald-600">{formatCurrency(totalAmount)}</span>
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/15 cursor-pointer"
        >
          <FiPlus className="text-sm" />
          Add Income
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 shadow-sm">
        <div className="flex items-end gap-3 justify-between">
          <div className="flex gap-3 items-end flex-1">
            {/* Source Filter */}
            <div className="max-w-[200px] flex-1">
              <label className="block text-[11px] font-medium text-gray-400 mb-1">SOURCE</label>
              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-[12px] px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-colors"
              >
                <option value="">All Sources</option>
                {SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            {/* Financial Year Filter */}
            <div className="max-w-[150px] flex-1">
              <label className="block text-[11px] font-medium text-gray-400 mb-1">FINANCIAL YEAR</label>
              <select
                value={financialYearFilter}
                onChange={(e) => {
                  setFinancialYearFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-[12px] px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-colors"
              >
                <option value="">All Years</option>
                {FINANCIAL_YEARS.map((fy) => (
                  <option key={fy} value={fy}>
                    {fy}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-[12px] font-medium rounded-lg cursor-pointer transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Income Records List */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[12px] text-gray-400 mt-2">Loading income ledger...</p>
          </div>
        ) : incomes.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <p className="text-[14px] text-gray-600 font-medium">No income records found</p>
            <p className="text-[12px] text-gray-400 mt-1">Add your salary, freelancing, or other income streams.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left text-gray-400 font-medium">
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Financial Year</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {incomes.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{item.source}</p>
                          {item.description && (
                            <p className="text-[11px] text-gray-400 truncate max-w-xs">{item.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium">
                        FY {item.financialYear}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {item.isRecurring ? (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          Recurring
                        </span>
                      ) : (
                        <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                          One-time
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      +{formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 hover:bg-gray-50 text-gray-500 hover:text-gray-900 rounded-lg cursor-pointer"
                        >
                          <FiEdit3 className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(item._id)}
                          className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-[11px] text-gray-500">
                  Page {page} of {pages} ({total} entries total)
                </span>
                <div className="flex gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 text-[11px] bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    className="px-2.5 py-1 text-[11px] bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-100 shadow-2xl p-6">
            <h2 className="text-[16px] font-semibold text-gray-900 mb-4">
              {editingIncome ? "Edit Income Stream" : "Add Income Stream"}
            </h2>
            <form onSubmit={handleSaveIncome} className="space-y-4">
              {/* Source & Financial Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Source *</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full text-[13px] px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
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
                    className="w-full text-[13px] px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
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
                    placeholder="75000"
                    min="0.01"
                    step="any"
                    className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Monthly salary, project bonus"
                  rows="2"
                  className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Recurring Switch */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isRecurring" className="text-[12px] text-gray-700 cursor-pointer select-none">
                  This is a recurring monthly income stream
                </label>
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
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[12px] font-medium rounded-lg cursor-pointer shadow-lg shadow-blue-600/10"
                >
                  {submitting ? "Saving..." : "Save Stream"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
