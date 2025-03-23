import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../api/apiClient";
import { toast } from "react-toastify";

const token =
  localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
const userData =
  localStorage.getItem("userData") || sessionStorage.getItem("userData");

// Helper function to safely parse JSON
const safeParse = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse localStorage data:", error);
    return null;
  }
};

const initialState = {
  user: userData ? safeParse(userData) : null,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
  emailSent: false, // For email verification
  resetEmailSent: false,
};

// ✅ **Async Thunks** (Move these above the slice)
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.message || "Registration failed"
      );
    }
  }
);

export const passwordResetRequest = createAsyncThunk(
  "auth/passwordResetRequest",
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/password-reset-request", {
        email,
      });
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request password reset"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      const { user, token, rememberMe } = action.payload;

      // ✅ Clear opposite storage first
      if (rememberMe) {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
      } else {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }

      // ✅ Update state and storage
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      if (rememberMe) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(user));
      } else {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("userData", JSON.stringify(user));
      }
    },
    // authSlice.js - authFailure reducer
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;

      // Clear both localStorage and sessionStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
    },
    extraReducers: (builder) => {
      builder
        // ✅ **Register User**
        .addCase(registerUser.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action) => {
          state.loading = false;
        })
        .addCase(registerUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })

        // ✅ **Password Reset Request**
        .addCase(passwordResetRequest.pending, (state) => {
          state.loading = true;
        })
        .addCase(passwordResetRequest.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(passwordResetRequest.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  },
});

export const { authStart, authSuccess, authFailure, logout } =
  authSlice.actions;

// ✅ **Login User**
export const loginUser = (userData) => async (dispatch) => {
  dispatch(authStart());
  try {
    const data = await apiClient.post("/auth/login", userData);
    // console.log(data);

    dispatch(
      authSuccess({
        user: data.user,
        token: data.token,
        rememberMe: data.rememberMe,
      })
    );
    return data;
  } catch (error) {
    dispatch(authFailure(error.response?.data?.message || "Login failed"));
  }
};

// ✅ **Fetch Current User**
export const getMe = () => async (dispatch) => {
  dispatch(authStart());
  try {
    const data = await apiClient.get("/auth/me");
    dispatch(
      authSuccess({
        user: data.user,
        token:
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken"),
        rememberMe: Boolean(localStorage.getItem("authToken")),
      })
    );
  } catch (error) {
    dispatch(authFailure("Authentication failed"));
    dispatch(logoutUser());
  }
};

// ✅ **Verify Email**
export const verifyEmail = (token) => async (dispatch) => {
  dispatch(authStart());
  try {
    const data = await apiClient.get(`/auth/verify-email?token=${token}`);
    return data;
  } catch (error) {
    dispatch(
      authFailure(error.response?.message || "Email verification failed")
    );
    throw error;
  }
};

export const resetPassword =
  ({ token, newPassword }) =>
  async (dispatch) => {
    dispatch(authStart());
    try {
      const data = await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
      });
      toast.success(data.message);
      return data.message;
    } catch (error) {
      dispatch(
        authFailure(error.response?.data?.message || "Failed to reset password")
      );
    }
  };

export const resendVerificationEmail = (email) => async (dispatch) => {
  dispatch(authStart());
  try {
    const { message } = await apiClient.post("/auth/resend-verification", {
      email,
    });
    return message;
  } catch (error) {
    dispatch(
      authFailure(
        error.response?.data?.message || "Failed to resend verification email"
      )
    );
  }
};

// ✅ **Update Profile**
export const updateProfile = (formData) => async (dispatch) => {
  dispatch(authStart());
  try {
    const data = await apiClient.put("/auth/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ Get storage type from existing token
    const rememberMe = Boolean(localStorage.getItem("authToken"));

    // ✅ Use correct storage for token
    const token = rememberMe
      ? localStorage.getItem("authToken")
      : sessionStorage.getItem("authToken");

    dispatch(
      authSuccess({
        user: data.user,
        token: token,
        rememberMe,
      })
    );

    return data;
  } catch (error) {
    dispatch(authFailure(error.message || "Failed to update profile"));
  }
};

// ✅ **Change Password**
export const changePassword = (passwordData) => async (dispatch) => {
  dispatch(authStart());
  try {
    const response = await apiClient.post(
      "/auth/change-password",
      passwordData
    );
    return response;
  } catch (error) {
    dispatch(
      authFailure(error.response?.data?.message || "Failed to change password")
    );
  }
};

// ✅ **Delete Account**
export const deleteAccount = () => async (dispatch) => {
  dispatch(authStart());
  try {
    await apiClient.delete("/auth/delete-account");
    dispatch(logout());
  } catch (error) {
    dispatch(
      authFailure(error.response?.data?.message || "Failed to delete account")
    );
  }
};

// ✅ **Logout User**
export const logoutUser = () => async (dispatch) => {
  try {
    console.log("🚀 Sending logout request to server...");

    // ✅ Call backend logout API to remove refreshToken
    await apiClient.post("/auth/logout");

    console.log("✅ Server logout successful. Clearing storage...");
  } catch (error) {
    console.error(
      "❌ Logout failed:",
      error.response?.data?.message || error.message
    );
  }

  // ✅ Clear both localStorage & sessionStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("userData");

  // ✅ Reset Redux state
  dispatch(logout());

  // ✅ Reload page to ensure full logout
  window.location.href = "/auth";
};

export default authSlice.reducer;
