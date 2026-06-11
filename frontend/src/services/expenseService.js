import { apiClient } from "./apiClient";

export const expenseService = {
  addExpense(expenseData) {
    return apiClient.post("/expenses", expenseData);
  },

  getExpenses(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiClient.get(`/expenses${queryString ? `?${queryString}` : ""}`);
  },

  getSummary(month, year) {
    const query = new URLSearchParams();
    if (month) query.append("month", month);
    if (year) query.append("year", year);
    const queryString = query.toString();
    return apiClient.get(`/expenses/summary${queryString ? `?${queryString}` : ""}`);
  },

  updateExpense(id, expenseData) {
    return apiClient.put(`/expenses/${id}`, expenseData);
  },

  deleteExpense(id) {
    return apiClient.delete(`/expenses/${id}`);
  }
};
