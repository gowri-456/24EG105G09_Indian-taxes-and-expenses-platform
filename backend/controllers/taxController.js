import {
  calculateOldRegimeTax,
  calculateNewRegimeTax,
  compareTaxRegimes,
  getTaxSavingSuggestions,
} from "../utils/taxUtils.js";
import Income from "../models/IncomeModel.js";

// ─── CALCULATE TAX (single regime) ───────────────────────────────────────────
export const calculateTax = async (req, res, next) => {
  try {
    const { grossIncome, regime = "both", deductions = {} } = req.body;

    let result;
    if (regime === "old") {
      result = calculateOldRegimeTax(grossIncome, deductions);
    } else if (regime === "new") {
      result = calculateNewRegimeTax(grossIncome);
    } else {
      result = compareTaxRegimes(grossIncome, deductions);
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ─── COMPARE BOTH REGIMES ─────────────────────────────────────────────────────
export const compareTax = async (req, res, next) => {
  try {
    const { grossIncome, deductions = {} } = req.body;
    const comparison = compareTaxRegimes(grossIncome, deductions);
    res.status(200).json({ success: true, data: comparison });
  } catch (err) {
    next(err);
  }
};

// ─── TAX SAVING SUGGESTIONS ───────────────────────────────────────────────────
export const taxSuggestions = async (req, res, next) => {
  try {
    const { grossIncome, deductions = {} } = req.body;
    const suggestions = getTaxSavingSuggestions(grossIncome, deductions);
    res.status(200).json({ success: true, count: suggestions.length, data: suggestions });
  } catch (err) {
    next(err);
  }
};

// ─── AUTO TAX FROM USER INCOME RECORDS ────────────────────────────────────────
export const autoCalculateTax = async (req, res, next) => {
  try {
    const { financialYear = "2024-25", deductions = {} } = req.body;

    // Sum all income for the FY from DB
    const incomeRecords = await Income.aggregate([
      { $match: { userId: req.user._id, financialYear } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const grossIncome = incomeRecords.length ? incomeRecords[0].total : 0;

    if (grossIncome === 0) {
      return res.status(200).json({
        success: true,
        message: "No income records found for this financial year",
        data: { grossIncome: 0 },
      });
    }

    const comparison = compareTaxRegimes(grossIncome, deductions);
    const suggestions = getTaxSavingSuggestions(grossIncome, deductions);

    res.status(200).json({
      success: true,
      data: {
        financialYear,
        grossIncome,
        ...comparison,
        suggestions,
      },
    });
  } catch (err) {
    next(err);
  }
};
