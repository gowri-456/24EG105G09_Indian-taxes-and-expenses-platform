import express from "express";
import {
  addIncome,
  getIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
} from "../controllers/incomeController.js";
import verifyToken from "../middleware/verifyToken.js";
import { validateIncome } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/",        validateIncome, addIncome);
router.get("/",                         getIncome);
router.get("/summary",                  getIncomeSummary);
router.put("/:id",      validateIncome, updateIncome);
router.delete("/:id",                   deleteIncome);

export default router;
