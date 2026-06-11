import { apiClient } from "./apiClient";

export const authService = {
  async login(email, password) {
    const data = await apiClient.post("/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  async register(userData) {
    const data = await apiClient.post("/auth/register", userData);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  async getProfile() {
    const data = await apiClient.get("/auth/profile");
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data.user;
  },

  async updateProfile(profileData) {
    const data = await apiClient.put("/auth/profile", profileData);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data.user;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};
