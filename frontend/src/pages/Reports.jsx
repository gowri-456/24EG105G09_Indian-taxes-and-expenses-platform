import { useState, useEffect } from "react";
import { expenseService } from "../services/expenseService";
import { incomeService } from "../services/incomeService";
import { taxService } from "../services/taxService";
import { toast } from "react-hot-toast";
import {
  FiBarChart2,
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownRight,
  FiActivity,
  FiPieChart,
  FiDownload,
} from "react-icons/fi";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const CATEGORY_COLORS = {
  "Food & Dining": "#10B981", // Emerald
  "Travel & Transport": "#3B82F6", // Blue
  Shopping: "#EC4899", // Pink
  "Bills & Utilities": "#F59E0B", // Amber
  Healthcare: "#EF4444", // Red
  Education: "#8B5CF6", // Purple
  Entertainment: "#6366F1", // Indigo
  Rent: "#14B8A6", // Teal
  EMI: "#F43F5E", // Rose
  Investments: "#06B6D4", // Cyan
  Other: "#6B7280", // Gray
};

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [estimatedTax, setEstimatedTax] = useState(0);

  const [expenseSummary, setExpenseSummary] = useState([]);
  const [incomeSummary, setIncomeSummary] = useState([]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // Fetch summaries for current year
      const expSumRes = await expenseService.getSummary(null, year);
      const incSumRes = await incomeService.getSummary(year);

      const expList = expSumRes.data || [];
      const incList = incSumRes.data || [];

      setExpenseSummary(expList);
      setIncomeSummary(incList);

      const totalExp = expSumRes.grandTotal || 0;
      const totalInc = incSumRes.grandTotal || 0;

      setTotalExpense(totalExp);
      setTotalIncome(totalInc);

      // Estimate tax based on New Regime (FY 2024-25 / standard 75k deduction)
      if (totalInc > 0) {
        const taxRes = await taxService.calculateTax(totalInc, "new");
        setEstimatedTax(taxRes.data?.totalTax || 0);
      } else {
        setEstimatedTax(0);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load reports summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [year]);

  const netSavings = totalIncome - totalExpense - estimatedTax;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // Donut chart Math helper
  let cumulativePercent = 0;
  const donutData = expenseSummary.map((item) => {
    const percent = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0;
    const currentCumulative = cumulativePercent;
    cumulativePercent += percent;
    return {
      category: item._id,
      amount: item.total,
      percent: percent.toFixed(1),
      color: CATEGORY_COLORS[item._id] || "#9CA3AF",
      startPercent: currentCumulative,
      endPercent: cumulativePercent,
    };
  });

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const handleDownloadReport = () => {
    const categoryRows = expenseSummary
      .map(
        (item) => `
          <tr>
            <td>${item._id}</td>
            <td>${formatCurrency(item.total)}</td>
            <td>${totalExpense > 0 ? ((item.total / totalExpense) * 100).toFixed(1) : 0}%</td>
          </tr>
        `
      )
      .join("");

    const incomeRows = incomeSummary
      .map(
        (item) => `
          <tr>
            <td>${item._id}</td>
            <td>${formatCurrency(item.total)}</td>
          </tr>
        `
      )
      .join("");

    const reportWindow = window.open("", "_blank", "width=900,height=700");
    if (!reportWindow) {
      toast.error("Please allow popups to download the report");
      return;
    }

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>FinTrack Report ${year}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
            h1 { margin: 0 0 4px; font-size: 24px; }
            h2 { margin-top: 28px; font-size: 16px; }
            p { color: #6b7280; margin: 0 0 20px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
            .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; }
            .label { color: #6b7280; font-size: 11px; text-transform: uppercase; font-weight: 700; }
            .value { font-size: 18px; font-weight: 700; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { color: #374151; background: #f9fafb; }
            @media print { button { display: none; } body { padding: 20px; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="float:right;padding:8px 12px;border:0;border-radius:8px;background:#2563eb;color:white;font-weight:700;cursor:pointer;">Save as PDF</button>
          <h1>FinTrack Financial Report</h1>
          <p>Year ${year}</p>

          <div class="grid">
            <div class="card"><div class="label">Annual Income</div><div class="value">${formatCurrency(totalIncome)}</div></div>
            <div class="card"><div class="label">Annual Expenses</div><div class="value">${formatCurrency(totalExpense)}</div></div>
            <div class="card"><div class="label">Estimated Tax</div><div class="value">${formatCurrency(estimatedTax)}</div></div>
            <div class="card"><div class="label">Net Savings</div><div class="value">${formatCurrency(netSavings)}</div></div>
          </div>

          <h2>Expense Categories</h2>
          <table>
            <thead><tr><th>Category</th><th>Amount</th><th>Share</th></tr></thead>
            <tbody>${categoryRows || "<tr><td colspan='3'>No expenses recorded.</td></tr>"}</tbody>
          </table>

          <h2>Income Sources</h2>
          <table>
            <thead><tr><th>Source</th><th>Amount</th></tr></thead>
            <tbody>${incomeRows || "<tr><td colspan='2'>No income recorded.</td></tr>"}</tbody>
          </table>
        </body>
      </html>
    `);
    reportWindow.document.close();
    reportWindow.focus();
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">Financial Reports</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Visual metrics, tax estimates, and savings trends for {year}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadReport}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <FiDownload className="text-sm" />
            Download PDF
          </button>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-[12px] px-3 py-1.5 bg-white border border-gray-200 rounded-lg outline-none cursor-pointer"
          >
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
            <option value="2024">Year 2024</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[12px] text-gray-400 mt-2">Compiling financials...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* Income */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider">Annual Income</span>
                <span className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <FiArrowUpRight className="text-sm" />
                </span>
              </div>
              <p className="text-[18px] font-semibold text-gray-900">{formatCurrency(totalIncome)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Aggregated from income ledger</p>
            </div>

            {/* Expense */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider">Annual Expenses</span>
                <span className="w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                  <FiArrowDownRight className="text-sm" />
                </span>
              </div>
              <p className="text-[18px] font-semibold text-gray-900">{formatCurrency(totalExpense)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Total transactions logged</p>
            </div>

            {/* Tax */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider">Est. Tax (New regime)</span>
                <span className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                  <FiActivity className="text-sm" />
                </span>
              </div>
              <p className="text-[18px] font-semibold text-gray-900">{formatCurrency(estimatedTax)}</p>
              <p className="text-[10px] text-gray-400 mt-1">Estimations u/s 87A rebate</p>
            </div>

            {/* Net Savings */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider">Net Savings</span>
                <span className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-sm" />
                </span>
              </div>
              <p className="text-[18px] font-semibold text-gray-900">{formatCurrency(netSavings)}</p>
              <p className={`text-[10px] mt-1 font-medium ${netSavings >= 0 ? "text-green-600" : "text-red-500"}`}>
                Savings Rate: {savingsRate}%
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-5 gap-5">
            {/* SVG Donut Chart for Categories */}
            <div className="col-span-3 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-4 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <FiPieChart className="text-blue-500" />
                Category Expense Share
              </h3>

              {totalExpense === 0 ? (
                <div className="h-64 flex items-center justify-center text-[12px] text-gray-400">
                  No expense records to display share distribution.
                </div>
              ) : (
                <div className="flex items-center gap-8">
                  {/* Custom Donut Chart (SVG) */}
                  <div className="relative w-44 h-44 shrink-0">
                    <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-full h-full transform -rotate-90">
                      {/* Base Background Circle */}
                      <circle cx="0" cy="0" r="0.8" fill="none" stroke="#F3F4F6" strokeWidth="0.32" />
                      
                      {/* Slices */}
                      {donutData.map((slice, i) => {
                        const start = getCoordinatesForPercent(slice.startPercent / 100);
                        const end = getCoordinatesForPercent(slice.endPercent / 100);
                        const largeArcFlag = slice.percent > 50 ? 1 : 0;
                        const pathData = [
                          `M ${start[0] * 0.8} ${start[1] * 0.8}`,
                          `A 0.8 0.8 0 <sup>${largeArcFlag}</sup> 1 <sup>${end[0] * 0.8}</sup> <sup>${end[1] * 0.8}</sup>`,
                        ].join(" ");

                        // For react safety, replace custom superscripts with clean coords
                        const pathString = `M ${start[0] * 0.8} ${start[1] * 0.8} A 0.8 0.8 0 ${largeArcFlag} 1 ${end[0] * 0.8} ${end[1] * 0.8}`;

                        return (
                          <path
                            key={i}
                            d={pathString}
                            fill="none"
                            stroke={slice.color}
                            strokeWidth="0.32"
                          />
                        );
                      })}
                    </svg>
                    {/* Inner Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">Total spent</span>
                      <span className="text-[14px] font-bold text-gray-800">{formatCurrency(totalExpense)}</span>
                    </div>
                  </div>

                  {/* Legend list */}
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {donutData.map((slice) => (
                        <div key={slice.category} className="flex items-start gap-1.5 text-[11px]">
                          <span
                            className="w-2.5 h-2.5 rounded shrink-0 mt-0.5"
                            style={{ backgroundColor: slice.color }}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-700 truncate">{slice.category}</p>
                            <p className="text-gray-400">{slice.percent}% ({formatCurrency(slice.amount)})</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Income vs Expenses Bar Chart */}
            <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-[14px] font-semibold text-gray-900 mb-4 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <FiBarChart2 className="text-blue-500" />
                Inflow vs Outflow
              </h3>

              <div className="h-64 flex flex-col justify-end pt-5">
                {totalIncome === 0 && totalExpense === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-[12px] text-gray-400">
                    No transactions ledger recorded.
                  </div>
                ) : (
                  <>
                    {/* SVG/HTML Bars */}
                    <div className="flex items-end gap-10 justify-center h-44 pb-3">
                      {/* Income Bar */}
                      <div className="flex flex-col items-center gap-2 w-14 h-full justify-end">
                        <span className="text-[10px] text-gray-400 font-semibold">{formatCurrency(totalIncome)}</span>
                        <div
                          className="w-full bg-emerald-400 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${
                              totalIncome > 0
                                ? (totalIncome / Math.max(totalIncome, totalExpense)) * 100
                                : 0
                            }%`,
                          }}
                        />
                        <span className="text-[11px] font-semibold text-gray-700">Inflow</span>
                      </div>

                      {/* Expense Bar */}
                      <div className="flex flex-col items-center gap-2 w-14 h-full justify-end">
                        <span className="text-[10px] text-gray-400 font-semibold">{formatCurrency(totalExpense)}</span>
                        <div
                          className="w-full bg-red-400 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${
                              totalExpense > 0
                                ? (totalExpense / Math.max(totalIncome, totalExpense)) * 100
                                : 0
                            }%`,
                          }}
                        />
                        <span className="text-[11px] font-semibold text-gray-700">Outflow</span>
                      </div>
                    </div>
                    
                    {/* Net savings status info */}
                    <div className="border-t border-gray-50 pt-2 text-center text-[12px] text-gray-500">
                      Remaining surplus:{" "}
                      <span className={`font-semibold ${netSavings >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {formatCurrency(netSavings)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
