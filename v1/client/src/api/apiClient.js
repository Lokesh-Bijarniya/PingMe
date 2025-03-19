import axios from "axios";
import { useDispatch } from "react-redux";
import { logoutUser, authSuccess } from "../redux/features/auth/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/v1/api",
  withCredentials: true, // ✅ Ensures cookies (refresh token) are sent
  timeout: 5000,
});


// Add file upload timeout
api.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    config.timeout = 30000; // 30 seconds for file uploads
  }
  return config;
});

// ✅ Attach access token from localStorage/sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);




// ✅ Handle 401 Unauthorized & Refresh Token Logic
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const dispatch = useDispatch();
      try {
        originalRequest._retry = true;
        
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        // ✅ Update storage
        const storage = localStorage.getItem("authToken") ? "local" : "session";
        storage === "local" 
          ? localStorage.setItem("authToken", data.token) 
          : sessionStorage.setItem("authToken", data.token);

       
        // ✅ Update Redux state
        dispatch(authSuccess({
          user: data.user,
          token: data.token,
          rememberMe: storage === "local"
        }));

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        dispatch(logoutUser());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);




export default api;
