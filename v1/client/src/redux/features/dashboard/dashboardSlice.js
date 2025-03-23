import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../api/apiClient";

// Initial State
const initialState = {
  stats: [], // Dashboard statistics
  loading: false,
  error: null,
};

// Slice Definition
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load dashboard stats";
      })
  },
});

// Export Reducer
export default dashboardSlice.reducer;

// Thunk Actions
// ✅ Fetch Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async () => {
    try {
      const response = await apiClient.get("/dashboard/stats");
      return response; // Return parsed stats data
    } catch (error) {
      throw new Error("Failed to fetch dashboard stats");
    }
  }
);