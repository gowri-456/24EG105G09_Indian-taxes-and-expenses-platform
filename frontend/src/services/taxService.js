import { apiClient } from "./apiClient";

export const taxService = {
  calculateTax(grossIncome, regime = "both", deductions = {}) {
    return apiClient.post("/tax/calculate", { grossIncome, regime, deductions });
  },

  compareTax(grossIncome, deductions = {}) {
    return apiClient.post("/tax/compare", { grossIncome, deductions });
  },

  getSuggestions(grossIncome, deductions = {}) {
    return apiClient.post("/tax/suggestions", { grossIncome, deductions });
  },

  autoCalculateTax(financialYear = "2024-25", deductions = {}) {
    return apiClient.post("/tax/auto-calculate", { financialYear, deductions });
  }
};
