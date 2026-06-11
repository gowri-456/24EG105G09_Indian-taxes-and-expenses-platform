import { useState, useEffect } from "react";
import { expenseService } from "../services/expenseService";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiFilter,
  FiCalendar,
  FiTag,
  FiCheckCircle,
  FiXCircle,
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
];

const PAYMENT_MODES = ["Cash", "UPI", "Credit Card", "Debit Card", "Net Banking", "Other"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[1]); // UPI default
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch expenses
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const filters = {
        page,
        limit: 10,
        category: categoryFilter,
      };

      if (monthFilter) filters.month = monthFilter;
      if (yearFilter) filters.year = yearFilter;

      const res = await expenseService.getExpenses(filters);
      let list = res.data || [];

      // Filter by search query on front-end for real-time reactivity
      if (searchQuery.trim()) {
        list = list.filter((exp) =>
          exp.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setExpenses(list);
      setTotal(res.total || 0);
      setTotalAmount(res.totalAmount || 0);
      setPages(res.pages || 1);
    } catch (err) {
      toast.error(err.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, categoryFilter, monthFilter, yearFilter]);

  // Handle search with local delay or manual refresh
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setTitle("");
    setAmount("");
    setCategory(CATEGORIES[0]);
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setPaymentMode(PAYMENT_MODES[1]);
    setIsTaxDeductible(false);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(new Date(expense.date).toISOString().split("T")[0]);
    setDescription(expense.description || "");
    setPaymentMode(expense.paymentMode || PAYMENT_MODES[1]);
    setIsTaxDeductible(expense.isTaxDeductible || false);
    setModalOpen(true);
  };

  // Save Expense (Create or Update)
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount || !category || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      amount: Number(amount),
      category,
      date,
      description,
      paymentMode,
      isTaxDeductible,
    };

    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, payload);
        toast.success("Expense updated successfully");
      } else {
        await expenseService.addExpense(payload);
        toast.success("Expense added successfully");
      }
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expenseService.deleteExpense(id);
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || "Failed to delete expense");
    }
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setSearchQuery("");
    setMonthFilter("");
    setYearFilter("");
    setPage(1);
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">Expenses Log</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Track and manage your expenses. Total logged:{" "}
            <span className="font-semibold text-gray-800">{formatCurrency(totalAmount)}</span>
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/15 cursor-pointer"
        >
          <FiPlus className="text-sm" />
          Add Expense
        </button>
      </div>

      {/* Filters Panel */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-5 gap-3 items-end">
          {/* Search */}
          <div className="col-span-2">
            <label className="block text-[11px] font-medium text-gray-400 mb-1">SEARCH</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <FiSearch />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Swiggy, Uber, Rent..."
                className="w-full text-[12px] pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">CATEGORY</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-[12px] px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-colors"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Month/Year Filter */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-gray-400 mb-1">MONTH</label>
              <select
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-[12px] px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
              >
                <option value="">All</option>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "short" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-gray-400 mb-1">YEAR</label>
              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full text-[12px] px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white"
              >
                <option value="">All</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-gray-900 hover:bg-black text-white text-[12px] font-medium rounded-lg cursor-pointer transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-[12px] font-medium rounded-lg cursor-pointer transition-colors"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[12px] text-gray-400 mt-2">Loading transactions...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <p className="text-[14px] text-gray-600 font-medium">No expenses found</p>
            <p className="text-[12px] text-gray-400 mt-1">Try relaxing filters or log a new expense.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left text-gray-400 font-medium">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-center">Tax Saving</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((item) => (
                  <tr key={item._id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      {item.description && (
                        <p className="text-[11px] text-gray-400 truncate max-w-xs">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                        <FiTag className="text-[10px]" />
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{item.paymentMode}</td>
                    <td className="py-3 px-4 text-center">
                      {item.isTaxDeductible ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          <FiCheckCircle className="text-sm" />
                          Eligible (80C/etc)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          <FiXCircle className="text-sm" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {formatCurrency(item.amount)}
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
                          onClick={() => handleDeleteExpense(item._id)}
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
              {editingExpense ? "Edit Expense Log" : "Log New Expense"}
            </h2>
            <form onSubmit={handleSaveExpense} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Swiggy, Electricity Bill"
                  className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
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
                    placeholder="1200"
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

              {/* Category & Payment Mode */}
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Payment Mode *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full text-[13px] px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
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
                  placeholder="Additional details..."
                  rows="2"
                  className="w-full text-[13px] px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Tax Saving Switch */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="isTaxDeductible"
                  checked={isTaxDeductible}
                  onChange={(e) => setIsTaxDeductible(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isTaxDeductible" className="text-[12px] text-gray-700 cursor-pointer select-none">
                  This expense is tax deductible (Section 80C, 80D, HRA, etc.)
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
                  {submitting ? "Saving..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
