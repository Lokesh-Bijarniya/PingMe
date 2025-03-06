import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/v1/api", // Use environment variable
  // baseURL : "http://localhost:8000/v1/api",
  timeout: 5000, // Timeout duration
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Always return the modified config
  },
  (error) => {
    return Promise.reject(error); // Forward the error to catch blocks
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response.data; // Simplify response data for the caller
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          console.error("Bad Request:", error.response.data.message);
          break;
        case 401:
          console.error("Unauthorized! Logging out...");
          localStorage.removeItem("authToken"); // Clear the token
          window.location.href = "/auth"; // Redirect to login page
          break;
        case 500:
          console.error("Server Error:", error.response.data.message);
          break;
        default:
          console.error("An error occurred:", error.response.data.message);
      }
    }
    return Promise.reject(error); // Forward the error to catch blocks
  }
);

export default api;