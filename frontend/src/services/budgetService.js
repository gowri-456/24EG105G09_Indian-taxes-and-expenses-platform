import { apiClient } from "./apiClient";

export const budgetService = {
  setBudget(budgetData) {
    return apiClient.post("/budget", budgetData);
  },

  getBudgets(month, year) {
    const query = new URLSearchParams();
    if (month) query.append("month", month);
    if (year) query.append("year", year);
    const queryString = query.toString();
    return apiClient.get(`/budget${queryString ? `?${queryString}` : ""}`);
  },

  getAlerts() {
    return apiClient.get("/budget/alerts");
  },

  deleteBudget(id) {
    return apiClient.delete(`/budget/${id}`);
  }
};
