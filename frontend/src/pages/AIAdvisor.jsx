import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { expenseService } from "../services/expenseService";
import { incomeService } from "../services/incomeService";
import { taxService } from "../services/taxService";
import { toast } from "react-hot-toast";
import {
  FiAward,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiCpu,
  FiCompass,
  FiPlus,
  FiTrash2,
  FiDollarSign,
} from "react-icons/fi";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const RECOMMENDATIONS = {
  Rent: { limit: 30, label: "Rent & Housing" },
  "Food & Dining": { limit: 15, label: "Food & Dining" },
  Shopping: { limit: 15, label: "Shopping & Wants" },
  "Travel & Transport": { limit: 10, label: "Travel & Transport" },
  "Bills & Utilities": { limit: 10, label: "Bills & Utilities" },
};

export default function AIAdvisor() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Financial aggregates
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [expenseSummary, setExpenseSummary] = useState([]);

  // Goals state (persisted in localStorage)
  const [goals, setGoals] = useState(() => {
    const savedGoals = localStorage.getItem("savings_goals");
    return savedGoals
      ? JSON.parse(savedGoals)
      : [
          { id: 1, name: "Emergency Fund", target: 150000, saved: 35000 },
          { id: 2, name: "Tax Saving Investments", target: 150000, saved: 60000 },
        ];
  });

  // Goal form state
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalSaved, setGoalSaved] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Fetch monthly income
      const incRes = await incomeService.getIncome({ month, year });
      const incTotal = incRes.totalAmount || 0;
      setMonthlyIncome(incTotal);

      // Fetch monthly expenses
      const expRes = await expenseService.getExpenses({ month, year });
      const expTotal = expRes.totalAmount || 0;
      setMonthlyExpense(expTotal);

      // Fetch category summaries
      const summaryRes = await expenseService.getSummary(month, year);
      setExpenseSummary(summaryRes.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load financial health indicators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Persist goals
  useEffect(() => {
    localStorage.setItem("savings_goals", JSON.stringify(goals));
  }, [goals]);

  // Calculations
  const surplus = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? (surplus / monthlyIncome) * 100 : 0;

  // 1. Financial Health Score calculation (0 - 100)
  const computeHealthScore = () => {
    if (monthlyIncome === 0) return 40; // baseline if no income is logged yet
    let score = 50;

    // Savings rate criteria (up to 30 points)
    if (savingsRate >= 35) score += 30;
    else if (savingsRate >= 20) score += 20;
    else if (savingsRate > 0) score += 10;
    else score -= 20; // negative savings rate is bad

    // Category distribution checks (up to 20 points)
    let hasOverspending = false;
    expenseSummary.forEach((cat) => {
      const rec = RECOMMENDATIONS[cat._id];
      if (rec) {
        const catPct = (cat.total / monthlyIncome) * 100;
        if (catPct > rec.limit) hasOverspending = true;
      }
    });
    if (!hasOverspending) score += 20;
    else score += 5;

    // Tax setup (up to 10 points)
    if (user?.preferredRegime && user.preferredRegime !== "not-decided") {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  };

  const healthScore = computeHealthScore();

  // Get score description & advice
  const getScoreProfile = (score) => {
    if (score >= 80) {
      return {
        rating: "Excellent",
        color: "text-green-600",
        bg: "bg-green-50/50 border-green-150",
        advisor: "Outstanding work! You have robust savings habits and high budget discipline. Continue investing surplus cash into high-yield tax-savers.",
      };
    } else if (score >= 60) {
      return {
        rating: "Good / Fair",
        color: "text-blue-600",
        bg: "bg-blue-50/50 border-blue-150",
        advisor: "Your finances are stable, but there is room for improvement. Try to audit your shopping or dining spends to boost your savings rate closer to 30%.",
      };
    } else {
      return {
        rating: "Needs Attention",
        color: "text-red-500",
        bg: "bg-red-50/50 border-red-150",
        advisor: "High outflows detected relative to your income. Focus on cutting wants (like Shopping & Dining) and establishing a basic 3-month emergency fund.",
      };
    }
  };

  const profile = getScoreProfile(healthScore);

  // 2. "Where Is My Salary Going?" Benchmarking
  const getBenchmarkStats = () => {
    const stats = [];
    
    // Add savings benchmark
    stats.push({
      label: "Savings & Investments",
      actual: savingsRate > 0 ? Math.round(savingsRate) : 0,
      rec: 20,
      actualAmount: surplus > 0 ? surplus : 0,
      isSavings: true,
    });

    // Add category benchmarks
    Object.entries(RECOMMENDATIONS).forEach(([catKey, rules]) => {
      const actualCat = expenseSummary.find((c) => c._id === catKey);
      const amount = actualCat ? actualCat.total : 0;
      const pct = monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0;

      stats.push({
        label: rules.label,
        actual: Math.round(pct),
        rec: rules.limit,
        actualAmount: amount,
        isSavings: false,
      });
    });

    return stats;
  };

  const benchmarks = getBenchmarkStats();

  // 3. Smart Tax Saving Advisor recommendations
  const getTaxAdvisorTips = () => {
    const tips = [];
    const annualIncome = monthlyIncome * 12 || user?.salary || 0;

    if (annualIncome === 0) {
      tips.push("Configure your default annual salary in your profile to receive tailored tax saving tips.");
      return tips;
    }

    if (annualIncome > 700000) {
      tips.push(
        `Your estimated annual income is ${formatCurrency(annualIncome)}. Since you are above the ₹7L rebate limit, look into Section 80C (EPF/PPF/ELSS) to claim up to ₹1.5 Lakhs in deductions under the Old Regime.`
      );
    }
    
    tips.push(
      "Maximize Section 80CCD(1B): Contributing up to ₹50,000 to the National Pension System (NPS) saves an extra ₹15,000 in tax (in 30% slab) under the Old Regime."
    );

    tips.push(
      "Claim HRA: If you live in rented accommodation, ensure you submit rent receipts to your employer. If you pay rent to parents, register a formal rent agreement."
    );

    return tips;
  };

  const taxTips = getTaxAdvisorTips();

  // 4. Goal actions
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalName || !goalTarget) {
      toast.error("Please provide target and name");
      return;
    }
    const newGoal = {
      id: Date.now(),
      name: goalName,
      target: Number(goalTarget),
      saved: goalSaved ? Number(goalSaved) : 0,
    };
    setGoals((prev) => [...prev, newGoal]);
    setGoalName("");
    setGoalTarget("");
    setGoalSaved("");
    toast.success("Savings Goal created!");
  };

  const handleDeleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.success("Goal removed");
  };

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      {/* Page Header */}
      <div className="mb-5">
        <h1 className="text-[20px] font-bold text-gray-900 flex items-center gap-2">
          <FiCpu className="text-blue-600" /> AI Coach & Financial Advisor
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Habit analysis, rule-of-thumb budgeting metrics, and tax-saving recommendations.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[12px] text-gray-400 mt-2">Analyzing cashflows...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {/* Left Column: Health Score & AI Coach Advice */}
          <div className="col-span-1 space-y-5">
            {/* Score Card */}
            <div className={`bg-white border rounded-2xl p-5 shadow-sm border-gray-100`}>
              <h2 className="text-[13px] font-bold text-gray-450 uppercase tracking-wider mb-4">
                Financial Health Score
              </h2>

              <div className="flex flex-col items-center py-2">
                {/* SVG Gauge */}
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    {/* Background gauge arc */}
                    <path
                      className="text-gray-100"
                      strokeWidth="3.2"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    {/* Progress arc */}
                    <path
                      className="text-blue-600 transition-all duration-500"
                      strokeDasharray={`${healthScore}, 100`}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[26px] font-extrabold text-gray-800">{healthScore}</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">out of 100</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className={`text-[15px] font-bold ${profile.color}`}>{profile.rating}</span>
                </div>
              </div>
            </div>

            {/* AI Coach Bubble */}
            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
                  <FiCpu className="text-white text-xs animate-pulse" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-blue-400">
                  AI Budget Coach
                </span>
              </div>
              <p className="text-[12.5px] leading-relaxed text-slate-100 font-medium">
                "{profile.advisor}"
              </p>
            </div>
          </div>

          {/* Right/Middle Column: Analyzer & Smart Tax & Savings Goals */}
          <div className="col-span-2 space-y-5">
            {/* Where is my salary going */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <FiCompass className="text-blue-500" />
                "Where Is My Salary Going?" Benchmarks
              </h2>

              {monthlyIncome === 0 ? (
                <div className="h-40 flex items-center justify-center text-[12px] text-gray-400">
                  Log income records this month to calculate salary distribution benchmark.
                </div>
              ) : (
                <div className="space-y-4">
                  {benchmarks.map((item, idx) => {
                    const isOver = !item.isSavings && item.actual > item.rec;
                    const isSavingsMet = item.isSavings && item.actual >= item.rec;

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[12px]">
                          <div>
                            <span className="font-semibold text-gray-800">{item.label}</span>
                            <span className="text-[10px] text-gray-400 ml-1.5">
                              (Target: {item.isSavings ? "Min" : "Max"} {item.rec}%)
                            </span>
                          </div>
                          <span className="text-gray-500 font-medium">
                            {item.actual}% ({formatCurrency(item.actualAmount)})
                          </span>
                        </div>

                        {/* Progress Bar comparison */}
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                          {/* Recommended Indicator line */}
                          <div
                            className="absolute top-0 bottom-0 border-l border-dashed border-gray-400 z-10"
                            style={{ left: `${item.rec}%` }}
                            title="Recommended limit"
                          />
                          <div
                            className={`h-full rounded-full transition-all duration-350 ${
                              item.isSavings
                                ? isSavingsMet
                                  ? "bg-green-500"
                                  : "bg-amber-500"
                                : isOver
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${Math.min(100, item.actual)}%` }}
                          />
                        </div>

                        {/* Benchmark Alerts */}
                        {isOver && (
                          <p className="text-[10.5px] text-red-500 font-medium flex items-center gap-1">
                            <FiAlertTriangle /> Warning: Your spending is above the recommended limit of {item.rec}%.
                          </p>
                        )}
                        {item.isSavings && !isSavingsMet && (
                          <p className="text-[10.5px] text-amber-600 font-medium flex items-center gap-1">
                            <FiAlertTriangle /> Tip: Boost savings rate closer to {item.rec}% to meet rules.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Smart Tax Saving Advisor */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <FiAward className="text-blue-500" />
                Smart Tax Saving Advisor
              </h2>

              <ul className="space-y-2.5">
                {taxTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[12px] text-gray-600">
                    <FiCheckCircle className="text-emerald-500 text-sm mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Goal-Based Savings Planner */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <FiTrendingUp className="text-blue-500" />
                Goal-Based Savings Planner
              </h2>

              {/* Goal List */}
              <div className="space-y-4 mb-5">
                {goals.map((g) => {
                  const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
                  const remaining = Math.max(0, g.target - g.saved);
                  
                  // Compute months remaining based on surplus
                  const monthlySurplus = surplus > 0 ? surplus : 0;
                  const monthsNeeded = monthlySurplus > 0 ? (remaining / monthlySurplus).toFixed(1) : "N/A";

                  return (
                    <div key={g.id} className="border border-gray-150 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-[12.5px] font-bold text-gray-800">{g.name}</h4>
                          <p className="text-[10.5px] text-gray-400 mt-0.5">
                            Target: {formatCurrency(g.target)} | Saved: {formatCurrency(g.saved)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteGoal(g.id)}
                          className="p-1 hover:bg-red-50 text-gray-450 hover:text-red-500 rounded cursor-pointer"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-500 font-medium">{pct}% Completed</span>
                        <span className="text-blue-600 font-semibold">
                          {remaining === 0
                            ? "Goal Achieved! 🎉"
                            : monthlySurplus > 0
                            ? `Est. ${monthsNeeded} months to reach target`
                            : "Increase surplus to calculate timeline"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Goal Form */}
              <form onSubmit={handleAddGoal} className="border-t border-gray-50 pt-4 space-y-3">
                <h4 className="text-[12px] font-bold text-gray-800">Add New Goal</h4>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Goal name (e.g. Car Downpayment)"
                    className="text-[12px] px-2.5 py-1.5 border border-gray-200 rounded-lg outline-none"
                  />
                  <input
                    type="number"
                    required
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="Target Amount (₹)"
                    min="1"
                    className="text-[12px] px-2.5 py-1.5 border border-gray-200 rounded-lg outline-none"
                  />
                  <input
                    type="number"
                    value={goalSaved}
                    onChange={(e) => setGoalSaved(e.target.value)}
                    placeholder="Current Saved (₹, optional)"
                    min="0"
                    className="text-[12px] px-2.5 py-1.5 border border-gray-200 rounded-lg outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    <FiPlus /> Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
