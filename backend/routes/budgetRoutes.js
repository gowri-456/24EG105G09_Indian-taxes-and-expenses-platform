import express from "express";
import {
  setBudget,
  getBudgets,
  deleteBudget,
  getBudgetAlerts,
} from "../controllers/budgetController.js";
import verifyToken from "../middleware/verifyToken.js";
import { validateBudget } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/",         validateBudget, setBudget);
router.get("/",                          getBudgets);
router.get("/alerts",                    getBudgetAlerts);
router.delete("/:id",                    deleteBudget);

export default router;
