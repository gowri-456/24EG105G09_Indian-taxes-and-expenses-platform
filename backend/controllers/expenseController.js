import Expense from "../models/ExpenseModel.js";

// ─── ADD EXPENSE ──────────────────────────────────────────────────────────────
export const addExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, message: "Expense added", data: expense });
  } catch (err) {
    next(err);
  }
};

// ─── GET ALL EXPENSES ─────────────────────────────────────────────────────────
export const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, month, year, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.user._id };
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalAmount,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: expenses,
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE EXPENSE ───────────────────────────────────────────────────────────
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.status(200).json({ success: true, message: "Expense updated", data: expense });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE EXPENSE ───────────────────────────────────────────────────────────
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
    res.status(200).json({ success: true, message: "Expense deleted" });
  } catch (err) {
    next(err);
  }
};

// ─── EXPENSE SUMMARY (category-wise) ─────────────────────────────────────────
export const getExpenseSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const matchStage = { userId: req.user._id };

    if (month && year) {
      matchStage.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      };
    }

    const summary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = summary.reduce((s, c) => s + c.total, 0);
    res.status(200).json({ success: true, grandTotal, data: summary });
  } catch (err) {
    next(err);
  }
};
