import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { expenseService } from "../services/expenseService";
import { incomeService } from "../services/incomeService";
import { budgetService } from "../services/budgetService";
import { taxService } from "../services/taxService";
import { toast } from "react-hot-toast";
import {
  FiTrendingDown,
  FiTrendingUp,
  FiCreditCard,
  FiFileText,
  FiPlus,
  FiArrowRight,
  FiHome,
  FiChevronRight,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({ title, value, icon, tone = "blue", detail }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-750",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">{title}</p>
      <p className="text-[20px] font-bold text-gray-900 mt-1">{value}</p>
      {detail && <p className="text-[11px] text-gray-400 mt-1">{detail}</p>}
    </div>
  );
}

function Charts({ expenseSummary = [] }) {
  const total = expenseSummary.reduce((sum, e) => sum + e.total, 0);
  
  // Custom interactive SVG bar and donut chart
  const categories = expenseSummary.slice(0, 4);
  const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-pink-500"];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-4">
        Category Split
      </h2>
      {expenseSummary.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-[12px] text-gray-400">
          No expenses recorded this period.
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c, i) => {
            const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
            return (
              <div key={c._id}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="text-gray-600 font-medium">{c._id}</span>
                  <span className="text-gray-400">{pct}% ({formatCurrency(c.total)})</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors[i % colors.length]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function buildBudgetMilestoneAlert(stats) {
  if (!stats.budgetLimit || stats.budgetLimit <= 0) return null;

  const usedPercent = Math.round((stats.totalExpenses / stats.budgetLimit) * 100);
  if (usedPercent >= 100) {
    return {
      level: "danger",
      message: `Monthly budget crossed: ${usedPercent}% used. Review spending now.`,
    };
  }
  if (usedPercent >= 90) {
    return {
      level: "danger",
      message: `Monthly budget alert: ${usedPercent}% used. You are close to the limit.`,
    };
  }
  if (usedPercent >= 70) {
    return {
      level: "warning",
      message: `Monthly budget watch: ${usedPercent}% used. Slow down spending to stay on track.`,
    };
  }

  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // States
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    budgetLimit: 50000, // Default limit fallback
    estimatedTax: 0,
    regimeName: "Compare regimes",
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // 1. Fetch current month expenses
      const expenseListRes = await expenseService.getExpenses({ month: currentMonth, year: currentYear });
      const expenses = expenseListRes.data || [];
      const monthlyExpenseTotal = expenseListRes.totalAmount || 0;

      // 2. Fetch current month income
      const incomeListRes = await incomeService.getIncome({ month: currentMonth, year: currentYear });
      const incomes = incomeListRes.data || [];
      const monthlyIncomeTotal = incomeListRes.totalAmount || 0;

      // 3. Fetch budgets to compute limit
      const budgetsRes = await budgetService.getBudgets(currentMonth, currentYear);
      const activeBudgets = budgetsRes.data || [];
      let totalBudgetLimit = activeBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
      if (totalBudgetLimit === 0) {
        // Check if there is a 'Total' category budget
        const totalBudget = activeBudgets.find((b) => b.category === "Total");
        totalBudgetLimit = totalBudget ? totalBudget.monthlyLimit : 50000; // fallback to 50k
      }

      // 4. Fetch tax estimates
      let taxValue = 0;
      let recommendedRegime = "New regime default";
      try {
        const annualSalary = user?.salary || 0;
        if (annualSalary > 0) {
          const taxRes = await taxService.compareTax(annualSalary);
          taxValue = taxRes.data?.comparison?.recommended === "Old Regime"
            ? taxRes.data.oldRegime?.totalTax
            : taxRes.data.newRegime?.totalTax;
          recommendedRegime = taxRes.data?.comparison?.reason || "New regime recommended";
        }
      } catch (err) {
        console.error("Failed to calculate tax estimation", err);
      }

      setStats({
        totalIncome: monthlyIncomeTotal,
        totalExpenses: monthlyExpenseTotal,
        budgetLimit: totalBudgetLimit,
        estimatedTax: taxValue,
        regimeName: recommendedRegime,
      });

      // 5. Build recent transactions: combine expenses and incomes
      const formattedExpenses = expenses.map((e) => ({
        id: e._id,
        title: e.title,
        category: e.category,
        date: new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        amount: -e.amount,
      }));

      const formattedIncomes = incomes.map((i) => ({
        id: i._id,
        title: i.source,
        category: "Income",
        date: new Date(i.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        amount: i.amount,
      }));

      const combined = [...formattedExpenses, ...formattedIncomes]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setRecentTransactions(combined);

      // 6. Fetch category-wise expense summaries
      const expSumRes = await expenseService.getSummary(currentMonth, currentYear);
      setExpenseSummary(expSumRes.data || []);

      // 7. Load alerts
      const alertsRes = await budgetService.getAlerts();
      setAlerts(alertsRes.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to sync dashboard summaries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const budgetUsed = stats.totalExpenses;
  const budgetLeft = Math.max(0, stats.budgetLimit - budgetUsed);
  const budgetPct = stats.budgetLimit > 0 ? Math.min(100, Math.round((budgetUsed / stats.budgetLimit) * 100)) : 0;
  const budgetMilestoneAlert = buildBudgetMilestoneAlert(stats);

  return (
    <div className="flex-1 overflow-y-auto bg-blue-50/40 p-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-4">
        <FiHome className="text-[13px]" />
        <span>Home</span>
        <FiChevronRight className="text-[12px]" />
        <span className="text-gray-800 font-medium">Dashboard</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(" ")[0] || "Arjun"} 👋
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Real-time financial summary for{" "}
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/add-expense"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10 cursor-pointer"
          >
            <FiPlus className="text-sm" />
            Add Expense
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[12px] text-gray-400 mt-2">Syncing financial status...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Active Budget Alerts */}
          {(budgetMilestoneAlert || alerts.length > 0) && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
              <h3 className="text-[12px] font-bold text-red-800 flex items-center gap-1.5">
                <FiAlertTriangle /> Budget Warnings & Alerts
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-red-700 font-medium">
                {budgetMilestoneAlert && (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{budgetMilestoneAlert.message}</span>
                  </div>
                )}
                {alerts.map((al, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{al.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Monthly income"
              value={formatCurrency(stats.totalIncome)}
              icon={<FiTrendingUp />}
              tone="green"
              detail="Total inflows this month"
            />
            <StatCard
              title="Monthly expenses"
              value={formatCurrency(stats.totalExpenses)}
              icon={<FiTrendingDown />}
              tone="red"
              detail="Total outflows this month"
            />
            <StatCard
              title="Budget left"
              value={formatCurrency(budgetLeft)}
              icon={<FiCreditCard />}
              tone="blue"
              detail={`${budgetPct}% of ${formatCurrency(stats.budgetLimit)} limit used`}
            />
            <StatCard
              title="Estimated annual tax"
              value={formatCurrency(stats.estimatedTax)}
              icon={<FiFileText />}
              tone="yellow"
              detail={stats.regimeName}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-5">
            {/* Category breakdown */}
            <div className="col-span-2">
              <Charts expenseSummary={expenseSummary} />
            </div>

            {/* Target Tracker */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Budget Utilization
                </h3>
                <p className="text-[11px] text-gray-400 leading-normal">
                  Remaining amount of configured limits for the month. Keep spending low to save more!
                </p>
              </div>

              <div className="my-4 text-center">
                <span className="text-[32px] font-extrabold text-blue-600">{budgetPct}%</span>
                <p className="text-[11px] font-medium text-gray-500 uppercase mt-0.5">Limit Consumed</p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                <FiCheckCircle />
                <span>{formatCurrency(budgetLeft)} left to spend</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">
                Recent transactions
              </h2>
              <Link
                to="/expenses"
                className="flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                View ledger
                <FiArrowRight className="text-[12px]" />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-6">
                No recent transaction logs. Add some expenses or income streams.
              </p>
            ) : (
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-gray-400 font-semibold">
                    <th className="py-2.5 px-2">Description</th>
                    <th className="py-2.5 px-2">Category / Source</th>
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-50 last:border-0 hover:bg-blue-50/20 transition-colors"
                    >
                      <td className="py-2.5 px-2 text-gray-900 font-semibold">{tx.title}</td>
                      <td className="py-2.5 px-2">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-gray-400 font-medium">{tx.date}</td>
                      <td
                        className={`py-2.5 px-2 text-right font-bold ${
                          tx.amount < 0 ? "text-red-500" : "text-emerald-600"
                        }`}
                      >
                        {tx.amount < 0 ? "−" : "+"}
                        {formatCurrency(Math.abs(tx.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
