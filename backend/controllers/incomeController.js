import Income from "../models/IncomeModel.js";

// ─── ADD INCOME ───────────────────────────────────────────────────────────────
export const addIncome = async (req, res, next) => {
  try {
    const income = await Income.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, message: "Income added", data: income });
  } catch (err) {
    next(err);
  }
};

// ─── GET ALL INCOME ───────────────────────────────────────────────────────────
export const getIncome = async (req, res, next) => {
  try {
    const { source, month, year, financialYear, page = 1, limit = 20 } = req.query;

    const filter = { userId: req.user._id };
    if (source) filter.source = source;
    if (financialYear) filter.financialYear = financialYear;
    if (month && year) {
      filter.date = {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month, 0, 23, 59, 59),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [incomes, total] = await Promise.all([
      Income.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
      Income.countDocuments(filter),
    ]);

    const totalAmount = incomes.reduce((sum, i) => sum + i.amount, 0);

    res.status(200).json({
      success: true,
      count: incomes.length,
      total,
      totalAmount,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: incomes,
    });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE INCOME ────────────────────────────────────────────────────────────
export const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!income) return res.status(404).json({ success: false, message: "Income record not found" });
    res.status(200).json({ success: true, message: "Income updated", data: income });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE INCOME ────────────────────────────────────────────────────────────
export const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ success: false, message: "Income record not found" });
    res.status(200).json({ success: true, message: "Income deleted" });
  } catch (err) {
    next(err);
  }
};

// ─── INCOME SUMMARY (source-wise) ─────────────────────────────────────────────
export const getIncomeSummary = async (req, res, next) => {
  try {
    const { year } = req.query;

    const matchStage = { userId: req.user._id };
    if (year) {
      matchStage.date = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31, 23, 59, 59),
      };
    }

    const summary = await Income.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$source",
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
