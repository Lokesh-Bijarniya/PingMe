import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  loginUser,
  resendVerificationEmail,
  authSuccess,
  authFailure,
  passwordResetRequest,
  getMe,
  logoutUser
} from "../redux/features/auth/authSlice";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import apiClient from '../api/apiClient';
import { motion } from "framer-motion";
import logoImg from "/src/assets/logoAuth.png";


const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [isSignup, setIsSignup] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    // Extract token and refreshToken from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
  
    if (token) {

      // Set tokens in local storage
      localStorage.setItem("authToken", token);
  
      // Set the token in API client headers
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
      // Remove tokens from URL for cleaner UI
      window.history.replaceState(null, null, window.location.pathname);
  
      // Fetch user data
      dispatch(getMe())
        .then(() => navigate("/"))
        .catch((error) => {
          console.error("Auth failed:", error);
          dispatch(logoutUser());
        });
    }
  }, [dispatch, navigate]);
  



  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignup) {
      const response = await dispatch(registerUser(formData));
      if (response) {
        setEmailSent(true);
        toast.success(response.message);
      } else {
        toast.error("Signup failed! Please try again.");
      }
    } else {
      const response = await dispatch(loginUser({ ...formData, rememberMe }));
      if (response) {
        toast.success("Logged in successfully!");
        navigate("/");
      } else {
        toast.error("Login failed! Check your credentials.");
      }
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/v1/api/auth/google`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = () => {
    return formData.email && formData.password && (!isSignup || formData.name);
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email!");
      return dispatch(authFailure("Please enter your email"));
    }

    try {
      const response = await dispatch(passwordResetRequest(formData.email));
      if (response) {
        toast.success(response.message);
      } else {
        toast.error("Failed to send reset link. Try again.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    }
  };

  const handleResendVerificationEmail = async () => {
    if (!formData.email) {
      return alert("Please enter your email");
    }
    try {
      const response = await dispatch(resendVerificationEmail(formData.email));
      alert(response || "Verification email resent successfully. Please check your inbox.");
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      alert(error.message || "Failed to resend verification email");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-200">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Left Branding Section */}
      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden">
        <motion.div 
          className="text-center space-y-8 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="p-6 rounded-full bg-white/10 backdrop-blur-lg shadow-2xl"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.img
              src={logoImg}
              alt="PingMe Logo"
              className="w-64 h-64 mx-auto hover:rotate-12 transition-transform duration-300"
              whileHover={{ scale: 1.1 }}
            />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {isSignup ? "Join PingMe" : "Welcome Back!"}
            </h2>
            <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
              {isSignup 
                ? "Start your journey with us and connect with friends in a whole new way" 
                : "Continue your conversations and stay connected"}
            </p>
          </motion.div>
        </motion.div>
        
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-20 left-20 w-24 h-24 bg-purple-100 rounded-full blur-xl opacity-50"
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-32 h-32 bg-blue-100 rounded-full blur-xl opacity-50"
          animate={{ y: [0, -40, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Right Auth Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <motion.div 
          className="bg-white/95 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Mobile Header */}
          <div className="md:hidden text-center mb-8">
            <motion.div
              className="p-4 rounded-full bg-white shadow-lg inline-block"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={logoImg}
                alt="PingMe Logo"
                className="w-24 h-24 mx-auto"
              />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-4">
              PingMe
            </h2>
          </div>

          {/* Form Content */}
          <motion.div layout className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {isSignup ? "Create Account" : "Welcome Back!"}
              </h2>
              <p className="text-gray-500 mt-2">
                {isSignup 
                  ? "Get started with your free account" 
                  : "Sign in to continue"}
              </p>
            </div>

            {error && (
              <motion.div
                className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </motion.div>
            )}

            {!emailSent ? (
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignup && (
                  <motion.div 
                    className="group relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center border border-gray-200/80 rounded-lg p-3 bg-white/80 backdrop-blur-sm">
                      <UserPlus className="text-gray-500 w-5 h-5 mr-2 transition-colors duration-300 group-focus-within:text-blue-600" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        className="w-full outline-none bg-transparent placeholder-gray-400 text-gray-700"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  className="group relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center border border-gray-200/80 rounded-lg p-3 bg-white/80 backdrop-blur-sm">
                    <Mail className="text-gray-500 w-5 h-5 mr-2 transition-colors duration-300 group-focus-within:text-blue-600" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      className="w-full outline-none bg-transparent placeholder-gray-400 text-gray-700"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </motion.div>

                <motion.div 
                  className="group relative"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center border border-gray-200/80 rounded-lg p-3 bg-white/80 backdrop-blur-sm">
                    <Lock className="text-gray-500 w-5 h-5 mr-2 transition-colors duration-300 group-focus-within:text-blue-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      className="w-full outline-none bg-transparent placeholder-gray-400 text-gray-700 pr-10"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {!isSignup && (
                  <label className="flex items-center text-gray-500 space-x-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember me</span>
                  </label>
                )}

                <motion.button
                  type="submit"
                  className={`w-full py-3.5 cursor-pointer rounded-xl font-semibold flex items-center justify-center transition-all ${
                    loading || !isFormValid() 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-100/50"
                  }`}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
                  ) : isSignup ? (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </>
                  )}
                </motion.button>
              </form>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-green-600 font-semibold mb-4">
                  ✅ Verification email sent to <strong>{formData.email}</strong>
                </p>
                <button
                  className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => setEmailSent(false)}
                >
                  Back to Signup
                </button>
              </div>
            )}

            <motion.div layout className="mt-6 text-center">
              <p className="text-gray-500">
                {isSignup ? "Already have an account?" : "New to PingMe?"}{" "}
                <button
                  className="font-semibold cursor-pointer text-blue-600 hover:text-purple-600 transition-colors"
                  onClick={() => setIsSignup(!isSignup)}
                >
                  {isSignup ? "Sign in here" : "Create account"}
                </button>
              </p>
            </motion.div>

            {!isSignup && (
              <div className="mt-4 space-y-2 text-center">
                <button
                  className="text-blue-600 cursor-pointer hover:text-purple-600 transition-colors block w-full"
                  onClick={handleForgotPassword}
                >
                  Forgot Password?
                </button>
                <button
                  className="text-blue-600 cursor-pointer hover:text-purple-600 transition-colors block w-full"
                  onClick={handleResendVerificationEmail}
                >
                  Resend Verification Email
                </button>
              </div>
            )}

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200/60" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/95 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleGoogleAuth}
              className="w-full py-3 rounded-xl cursor-pointer bg-white border border-gray-200/80 text-gray-700 hover:border-blue-200 hover:bg-blue-50/50 transition-colors flex items-center justify-center"
              whileHover={{ y: -2 }}
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Continue with Google
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;