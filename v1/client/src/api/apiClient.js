import axios from "axios";

// Create an Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/v1/api", // Your API base URL
  timeout: 5000, // Timeout duration
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Add a token to headers if available
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Request Intercepted: ", config); // Log the request for debugging
    return config; // Always return the modified config
  },
  (error) => {
    console.error("Request Error: ", error); // Handle errors before the request is sent
    return Promise.reject(error); // Forward the error to catch blocks
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log("Response Intercepted: ", response); // Log the response for debugging
    return response.data; // Simplify response data for the caller
  },
  (error) => {
    if (error.response) {
      // Check for specific status codes (e.g., 401 Unauthorized)
      if (error.response.status === 401) {
        console.error("Unauthorized! Logging out...");
        // Perform logout or redirect logic here
      }
    }

    console.error("Response Error: ", error); // Log the error globally
    return Promise.reject(error); // Forward the error to catch blocks
  }
);

export default api;
