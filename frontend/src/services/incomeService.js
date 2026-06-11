import { apiClient } from "./apiClient";

export const incomeService = {
  addIncome(incomeData) {
    return apiClient.post("/income", incomeData);
  },

  getIncome(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiClient.get(`/income${queryString ? `?${queryString}` : ""}`);
  },

  getSummary(year) {
    const query = new URLSearchParams();
    if (year) query.append("year", year);
    const queryString = query.toString();
    return apiClient.get(`/income/summary${queryString ? `?${queryString}` : ""}`);
  },

  updateIncome(id, incomeData) {
    return apiClient.put(`/income/${id}`, incomeData);
  },

  deleteIncome(id) {
    return apiClient.delete(`/income/${id}`);
  }
};
