import { body, validationResult } from "express-validator";

// ─── HELPER: Run validations ──────────────────────────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── AUTH VALIDATORS ──────────────────────────────────────────────────────────
export const validateRegister = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").trim().isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate,
];

export const validateLogin = [
  body("email").trim().isEmail().withMessage("Please enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// ─── EXPENSE VALIDATORS ───────────────────────────────────────────────────────
export const validateExpense = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("category").notEmpty().withMessage("Category is required"),
  body("date").isISO8601().withMessage("Invalid date format"),
  validate,
];

// ─── INCOME VALIDATORS ────────────────────────────────────────────────────────
export const validateIncome = [
  body("source").notEmpty().withMessage("Income source is required"),
  body("amount").isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),
  body("date").isISO8601().withMessage("Invalid date format"),
  validate,
];

// ─── BUDGET VALIDATORS ────────────────────────────────────────────────────────
export const validateBudget = [
  body("category").notEmpty().withMessage("Category is required"),
  body("monthlyLimit").isFloat({ gt: 0 }).withMessage("Monthly limit must be a positive number"),
  body("month").isInt({ min: 1, max: 12 }).withMessage("Month must be between 1 and 12"),
  body("year").isInt({ min: 2020 }).withMessage("Invalid year"),
  validate,
];

// ─── TAX VALIDATORS ───────────────────────────────────────────────────────────
export const validateTaxCalc = [
  body("grossIncome").isFloat({ gt: 0 }).withMessage("Gross income must be a positive number"),
  validate,
];
