import Budget from "../models/BudgetModel.js";
import Expense from "../models/ExpenseModel.js";

// ─── SET / UPDATE BUDGET ──────────────────────────────────────────────────────
export const setBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month, year, alertThreshold } = req.body;

    // Upsert: update if exists, create if not
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, category, month, year },
      { monthlyLimit, alertThreshold },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Budget set successfully", data: budget });
  } catch (err) {
    next(err);
  }
};

// ─── GET BUDGETS WITH SPENDING STATUS ─────────────────────────────────────────
export const getBudgets = async (req, res, next) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;

    const budgets = await Budget.find({
      userId: req.user._id,
      month: Number(month),
      year: Number(year),
    });

    // For each budget, get actual spending from Expense model
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: "$category", spent: { $sum: "$amount" } } },
    ]);

    const spendingMap = {};
    expensesByCategory.forEach((e) => { spendingMap[e._id] = e.spent; });

    const budgetsWithStatus = budgets.map((b) => {
      const spent    = spendingMap[b.category] || 0;
      const remaining = Math.max(0, b.monthlyLimit - spent);
      const usedPercent = ((spent / b.monthlyLimit) * 100).toFixed(1);
      const isOverBudget = spent > b.monthlyLimit;
      const isNearLimit  = !isOverBudget && Number(usedPercent) >= b.alertThreshold;

      return {
        ...b.toObject(),
        spent,
        remaining,
        usedPercent: Number(usedPercent),
        isOverBudget,
        isNearLimit,
        status: isOverBudget ? "over" : isNearLimit ? "warning" : "ok",
      };
    });

    res.status(200).json({ success: true, month, year, data: budgetsWithStatus });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE BUDGET ────────────────────────────────────────────────────────────
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });
    res.status(200).json({ success: true, message: "Budget deleted" });
  } catch (err) {
    next(err);
  }
};

// ─── BUDGET ALERTS ────────────────────────────────────────────────────────────
export const getBudgetAlerts = async (req, res, next) => {
  try {
    const month = new Date().getMonth() + 1;
    const year  = new Date().getFullYear();

    const budgets = await Budget.find({ userId: req.user._id, month, year });
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    const expensesByCategory = await Expense.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$category", spent: { $sum: "$amount" } } },
    ]);

    const spendingMap = {};
    expensesByCategory.forEach((e) => { spendingMap[e._id] = e.spent; });

    const alerts = budgets
      .map((b) => {
        const spent = spendingMap[b.category] || 0;
        const usedPercent = (spent / b.monthlyLimit) * 100;
        if (usedPercent >= b.alertThreshold) {
          return {
            category: b.category,
            limit: b.monthlyLimit,
            spent,
            usedPercent: usedPercent.toFixed(1),
            isOverBudget: spent > b.monthlyLimit,
            message:
              spent > b.monthlyLimit
                ? `⚠️ Over budget! Spent ₹${spent.toLocaleString("en-IN")} of ₹${b.monthlyLimit.toLocaleString("en-IN")} limit`
                : `⚡ ${usedPercent.toFixed(0)}% of ${b.category} budget used`,
          };
        }
        return null;
      })
      .filter(Boolean);

    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    next(err);
  }
};
