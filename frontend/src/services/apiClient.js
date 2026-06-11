let rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (rawBaseUrl.endsWith("/")) {
  rawBaseUrl = rawBaseUrl.slice(0, -1);
}
if (!rawBaseUrl.endsWith("/api")) {
  rawBaseUrl = `${rawBaseUrl}/api`;
}
const BASE_URL = rawBaseUrl;

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || "Something went wrong";
    const error = new Error(errorMsg);
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: "PUT", body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),
};
