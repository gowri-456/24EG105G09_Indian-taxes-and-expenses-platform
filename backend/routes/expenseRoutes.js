import express from "express";
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from "../controllers/expenseController.js";
import verifyToken from "../middleware/verifyToken.js";
import { validateExpense } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All expense routes are protected
router.use(verifyToken);

router.post("/",          validateExpense, addExpense);
router.get("/",                            getExpenses);
router.get("/summary",                     getExpenseSummary);
router.put("/:id",        validateExpense, updateExpense);
router.delete("/:id",                      deleteExpense);

export default router;
