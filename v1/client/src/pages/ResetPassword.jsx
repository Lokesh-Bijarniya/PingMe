import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../redux/features/auth/authSlice";
import { AlertCircle, CheckCircle, Lock, Loader2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");

  // Extract token from URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    if (!token) {
      setSuccess("");
      navigate("/auth");
    }
  }, [token, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!token) return;
    if (newPassword !== confirmPassword) return;

    const response = await dispatch(resetPassword({ token, newPassword }));

    if (response) {
      setSuccess("Password reset successful!");
      setTimeout(() => navigate("/auth"), 3000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-600 text-center">
          🔐 Reset Password
        </h2>
        <p className="text-gray-500 text-center">Enter your new password below.</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center mt-4">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center mt-4">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* Password Reset Form */}
        <form onSubmit={handleResetPassword} className="space-y-5 mt-4">
          {/* New Password Field */}
          <div className="relative flex items-center border border-gray-300 rounded-lg p-3 bg-white shadow-sm">
            <Lock className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="password"
              placeholder="New Password"
              className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="relative flex items-center border border-gray-300 rounded-lg p-3 bg-white shadow-sm">
            <Lock className="text-gray-500 w-5 h-5 mr-2" />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Reset Password"}
          </button>
        </form>

        {/* Back to Login Link */}
        <p className="mt-4 text-gray-500 text-center">
          Remember your password?{" "}
          <button className="text-blue-500 font-semibold hover:underline" onClick={() => navigate("/login")}>
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
