import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import apiClient from "../api/apiClient";
import { registerUser, loginUser, authSuccess, authFailure } from "../redux/features/auth/authSlice";
import { LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

const AuthPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token") ? decodeURIComponent(queryParams.get("token")) : null;
    const tokenFromLocalStorage = localStorage.getItem("authToken");
  
    const token = tokenFromUrl || tokenFromLocalStorage;
  
    if (token) {
      console.log("Token found:", token); // Debugging
  
      // Store the token in localStorage if it came from the URL
      if (tokenFromUrl) {
        localStorage.setItem("authToken", token);
      }
  
      // Fetch user data using /auth/me
      apiClient
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("Response from /auth/me:", response); // Debugging
          dispatch(authSuccess(response));
          window.location.href = "/";
        })
        .catch((error) => {
          console.error("Failed to fetch user data:", error);
          dispatch(authFailure("Failed to authenticate user"));
          localStorage.removeItem("authToken"); // Clear invalid token
        });
    }
  }, [dispatch,location.search]); 

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    isSignup ? dispatch(registerUser(formData)) : dispatch(loginUser(formData));
  };

  const handleGoogleAuth = () => {
    window.location.href = `${apiClient}/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200">
      <div className="bg-gray-50 p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-blue-500 mb-2">PingMe</h2>
        <p className="text-gray-500">
          {isSignup ? "Create an account to start chatting!" : "Welcome back to PingMe!"}
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded-lg flex items-center mt-3">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 mt-4">
          {isSignup && (
            <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
              <UserPlus className="text-gray-500 w-5 h-5 mr-2" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="w-full outline-none bg-transparent"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
            <Mail className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full outline-none bg-transparent"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
            <Lock className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full outline-none bg-transparent"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-gray-500">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button className="text-blue-400 hover:underline" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>

        <div className="flex items-center my-4">
          <div className="w-full h-px bg-gray-300"></div>
          <p className="px-2 text-gray-500">OR</p>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleAuth}
          className="w-full bg-red-500 text-white py-2 rounded-lg flex items-center justify-center hover:bg-red-600 transition"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
