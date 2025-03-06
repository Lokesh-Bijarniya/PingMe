import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from '../../../api/apiClient';

// ✅ Fetch Call History (Async Thunk)
export const fetchCallHistory = createAsyncThunk(
  "call/fetchCallHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/calls/call-history');
      return response; // Ensure `.data` is returned
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch call history");
    }
  }
);

const callSlice = createSlice({
  name: "call",
  initialState: {
    incomingCall: null, // Stores incoming call details
    currentCall: null, // Stores active call details
    callStatus: "idle", // idle, ringing, accepted, rejected, ended
    callHistory: [],
    loading: false,
    error: null,
  },
  reducers: {
    // ✅ Handle incoming call
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
      state.callStatus = "ringing";
    },

    // ✅ Accept Call and Set Current Call
    acceptCall: (state) => {
      if (state.incomingCall) {
        state.currentCall = state.incomingCall; // Move incoming call to active call
        state.callStatus = "accepted";
        state.incomingCall = null; // Clear incoming call
      }
    },

    // ✅ End Call (Reset Call State)
    endCall: (state) => {
      if (state.currentCall) {
        state.callHistory.unshift(state.currentCall); // Save to history
      }
      state.currentCall = null;
      state.callStatus = "ended";
    },

    // ✅ Reject Call
    rejectCall: (state) => {
      state.incomingCall = null;
      state.callStatus = "rejected";
    },

    // ✅ Clear Call State (New Reducer)
    clearCallState: (state) => {
      state.incomingCall = null;
      state.currentCall = null;
      state.callStatus = "idle";
    },
    // ✅ Set Current Call (Used when initiating or accepting a call)
    setCurrentCall: (state, action) => {
      state.currentCall = action.payload;
      state.callStatus = "accepted"; // Automatically set status to accepted
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCallHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.callHistory = action.payload;
      })
      .addCase(fetchCallHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setIncomingCall, 
  acceptCall, 
  endCall, 
  rejectCall, 
  clearCallState, // Export the new reducer
  setCurrentCall,
  callHistory
} = callSlice.actions;

export default callSlice.reducer;