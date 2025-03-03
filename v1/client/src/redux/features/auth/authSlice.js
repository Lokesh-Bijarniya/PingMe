import { createSlice } from "@reduxjs/toolkit";
import apiClient from "../../../api/apiClient";


const token = localStorage.getItem("authToken");
const userData = localStorage.getItem("userData");


// Helper function to safely parse JSON
const safeParse = (data) => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse localStorage data:", error);
    return null; // Return null if parsing fails
  }
};

const initialState = {
  user: userData ? safeParse(userData) : null,
  token: token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      const { userData, token } = action.payload;
      state.user = userData;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Store the token and user data in localStorage for persistence
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(userData));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;

      // Clear all authentication-related data from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // Clear all authentication-related data from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logout,
  updateUserProfile,
} = authSlice.actions;

// Async Thunk Actions
export const registerUser = (userData) => async (dispatch) => {
  dispatch(authStart());
  try {
    const response = await apiClient.post("/auth/register", userData);
    dispatch(authSuccess(response));
  } catch (error) {
    dispatch(authFailure(error.response?.data?.message || "Registration failed"));
  }
};

export const loginUser = (userData) => async (dispatch) => {
  dispatch(authStart());
  try {
    const response = await apiClient.post("/auth/login", userData);
    dispatch(authSuccess(response));
    window.location.href = "/";
  } catch (error) {
    dispatch(authFailure(error.response?.data?.message || "Login failed"));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await apiClient.post("/auth/logout");
    dispatch(logout());
  } catch (error) {
    console.error("Logout failed:", error);
    dispatch(logout());
  }
};
// Update Profile
export const updateProfile = (formData) => async (dispatch) => {
  dispatch(authStart());

  try {
    const response = await apiClient.put("/auth/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Profile Update Response:", response); // Debugging

    if (response) {
      const { userData, token } = response; // Extract userData & new token

      dispatch(authSuccess(response)); // Update both user & token in Redux

      localStorage.setItem("userData", JSON.stringify(userData)); // Update localStorage
      localStorage.setItem("authToken", token); // Store new token

      return response;
    } else {
      throw new Error("No data received from the server");
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    dispatch(authFailure(error.message || "Failed to update profile"));
    throw error;
  }
};

 

// Change Password
export const changePassword = (passwordData) => async (dispatch) => {
  dispatch(authStart());

  try {
    const response = await apiClient.post("/auth/change-password", passwordData);

    // Check if response and response.data exist
    if (!response) {
      throw new Error("Invalid response from the server");
    }

    const { userData, token, message } = response;

    // Preserve existing user data if response does not contain new data
    const existingUser = JSON.parse(localStorage.getItem("userData"));
    const existingToken = localStorage.getItem("token");

    if (userData) {
      dispatch(authSuccess({ user: userData, token: token || existingToken }));
      localStorage.setItem("userData", JSON.stringify(userData));
    } else {
      dispatch(authSuccess({ user: existingUser, token: existingToken }));
    }

    if (token) {
      localStorage.setItem("token", token);
    }

    return { message: message || "Password changed successfully!" };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to change password";
    dispatch(authFailure(errorMessage));
    throw new Error(errorMessage);
  }
};



// Delete Account
export const deleteAccount = () => async (dispatch) => {
  dispatch(authStart());
  try {
    await apiClient.delete("/auth/delete-account");
    dispatch(logout()); // Clear user data and token
    return true; // Ensure the promise resolves
  } catch (error) {
    dispatch(authFailure(error.response?.data?.message || "Failed to delete account"));
    throw error; // Ensure the promise rejects with the error
  }
};
export default authSlice.reducer;