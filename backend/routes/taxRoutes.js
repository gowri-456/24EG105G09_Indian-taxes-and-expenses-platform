import express from "express";
import {
  calculateTax,
  compareTax,
  taxSuggestions,
  autoCalculateTax,
} from "../controllers/taxController.js";
import verifyToken from "../middleware/verifyToken.js";
import { validateTaxCalc } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/calculate",     validateTaxCalc, calculateTax);
router.post("/compare",       validateTaxCalc, compareTax);
router.post("/suggestions",   validateTaxCalc, taxSuggestions);
router.post("/auto-calculate",                 autoCalculateTax); // Uses income from DB

export default router;
