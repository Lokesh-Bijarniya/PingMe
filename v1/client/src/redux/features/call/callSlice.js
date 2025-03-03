import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from '../../../api/apiClient'
import SocketService from '../../../services/socket'


// ✅ Send Call Request
export const sendCallRequest = createAsyncThunk(
  "call/sendCallRequest",
  async ({ recipientId, type }, { getState, rejectWithValue }) => {
    if (!SocketService.socket || !SocketService.socket.connected) {
      console.warn("⚠️ WebSocket not connected. Attempting to reconnect...");
      SocketService.connect(); // Ensure caller is connected
    }

    try {
      const response = await apiClient.post("/calls/call-request", { recipientId, type });
      return response;
    } catch (error) {
      console.error("❌ Call request failed:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Failed to send call request");
    }
  }
);

// ✅ Fetch Call History
export const fetchCallHistory = createAsyncThunk(
  "call/fetchCallHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/calls/call-history");
      // console.log("Call History", response);
      return response;
    } catch (error) {
      console.error("❌ Fetch call history failed:", error.response?.data || error.message);
      return rejectWithValue("Failed to fetch call history");
    }
  }
);

// ✅ Call Slice
const callSlice = createSlice({
  name: "call",
  initialState: {
    callHistory: [],
    currentCall: null,
    incomingCall: null,
    isCalling: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    receiveCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    setCurrentCall: (state, action) => {
      state.currentCall = action.payload;
      state.isCalling = true;
    },
    clearCallState: (state) => {
      state.currentCall = null;
      state.incomingCall = null;
      state.isCalling = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendCallRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendCallRequest.fulfilled, (state, action) => {
        state.currentCall = action.payload;
        state.isLoading = false;
      })
      .addCase(sendCallRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCallHistory.fulfilled, (state, action) => {
        state.callHistory = action.payload;
      })
      .addCase(fetchCallHistory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { receiveCall, setCurrentCall, clearCallState } = callSlice.actions;
export default callSlice.reducer;
