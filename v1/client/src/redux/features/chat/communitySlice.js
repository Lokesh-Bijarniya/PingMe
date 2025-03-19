import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/apiClient";

const initialState = {
  joinedCommunities: [],
  discoveredCommunities: [],
  allCommunities: [],
  communities: {},
  currentCommunity: null,
  members: [],
  loading: false,
  error: null,
};

// Async Thunks should be declared before slice creation
export const fetchCommunities = createAsyncThunk(
  'community/fetchCommunities',
  async (_, { getState, rejectWithValue }) => {
    try {
      const  data  = await api.get('/communities'); // Destructure data directly
      const userId = getState().auth.user?._id;
      return {
        data, // Directly return the data array
        userId
      };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// communitySlice.js (createCommunity thunk)
export const createCommunity = createAsyncThunk(
  "community/createCommunity",
  async (communityData, { rejectWithValue }) => { // Rename formData to communityData
    try {
      const response = await api.post("/communities", communityData, {
        headers: {
          'Content-Type': 'application/json' // Explicitly set JSON content type
        }
      });
      return response;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const joinCommunity = createAsyncThunk(
  "community/joinCommunity",
  async (communityId, { getState, rejectWithValue }) => {
    try {
      await api.post(`/communities/${communityId}/join`);
      console.log("join-community", communityId, getState().auth.user._id);
      // Use getState from thunkAPI instead of imported one
      return { communityId, userId: getState().auth.user._id };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchCommunityMembers = createAsyncThunk(
  "community/fetchMembers",
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/communities/${communityId}/members`);
      return response;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const searchCommunities = createAsyncThunk(
  "community/search",
  async (query, { getState }) => {
    const { allCommunities, joinedCommunities } = getState().community;
    const joinedIds = joinedCommunities.map(c => c._id);
    
    return allCommunities.filter(community => {
      const matchesSearch = community.name.toLowerCase().includes(query.toLowerCase());
      const isNotJoined = !joinedIds.includes(community._id);
      return matchesSearch && isNotJoined;
    });
  }
);

export const fetchCommunityMessages = createAsyncThunk(
  'community/fetchMessages',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/communities/${communityId}/messages`);
      return { communityId, messages: response.messages };
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);


export const leaveCommunity = createAsyncThunk(
  "community/leaveCommunity",
  async (communityId, { getState, rejectWithValue }) => {
    try {
      await api.post(`/communities/${communityId}/leave`);
      return { communityId, userId: getState().auth.user._id };
    } catch (err) {
      return rejectWithValue(err.response);
    }
  }
);


// In communitySlice.js
export const deleteCommunity = createAsyncThunk(
  'community/deleteCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/communities/delete/${communityId}`);
      return response;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const communitySlice = createSlice({
  name: "community",
  initialState,
  reducers: {
    setCurrentCommunity: (state, action) => {
      state.currentCommunity = action.payload;
    },
    updateCommunityPresence: (state, action) => {
      const { userId, online } = action.payload;
      const member = state.members.find((m) => m._id === userId);
      if (member) member.online = online;
    },
    communityUpdated: (state, action) => {
      const index = state.allCommunities.findIndex(
        (c) => c._id === action.payload._id
      );
      if (index !== -1) state.allCommunities[index] = action.payload;
    },
    newCommunityMessage: (state, action) => {
      const { communityId, message } = action.payload;
      const community = state.communities[communityId];
      if (community) {
        community.messages = community.messages || [];
        community.messages.push(message);
      }
    },
    receiveCommunityInvite: (state, action) => {
      state.invitations = state.invitations || [];
      state.invitations.push(action.payload);
    },
    // Moved search reducer inside reducers object
    searchCommunities: (state, action) => {
      const query = action.payload.toLowerCase();
      state.discoveredCommunities = state.allCommunities.filter(
        (community) =>
          community.name.toLowerCase().includes(query) &&
          !state.joinedCommunities.some((c) => c._id === community._id)
      );
    },
    updateMembers: (state, action) => {
      const { communityId, userId } = action.payload;
      const community = state.communities[communityId];
      if (community) {
        community.members = community.members.filter(m => m._id !== userId);
      }
    },
    removeFromJoined: (state, action) => {
      state.joinedCommunities = state.joinedCommunities.filter(
        c => c._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Update fetchCommunities.fulfilled case
.addCase(fetchCommunities.fulfilled, (state, action) => {
  state.loading = false;
  const { data: communities, userId } = action.payload;
  
  // Initialize communities object
  state.communities = communities.reduce((acc, community) => {
    acc[community._id] = {
      ...community,
      messages: []
    };
    return acc;
  }, {});

  // Keep existing array updates
  state.allCommunities = communities;
  state.joinedCommunities = communities.filter(c => 
    c.members?.some(m => m._id === userId)
  );
  state.discoveredCommunities = communities.filter(c => 
    !state.joinedCommunities.some(jc => jc._id === c._id)
  );
})
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(createCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.allCommunities.push(action.payload);
        state.joinedCommunities.push(action.payload);
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        const joinedCommunity = state.allCommunities.find(
          c => c._id === action.payload.communityId
        );
        if (joinedCommunity) {
          state.joinedCommunities.push(joinedCommunity);
          state.discoveredCommunities = state.discoveredCommunities.filter(
            c => c._id !== action.payload.communityId
          );
        }
      })
      .addCase(fetchCommunityMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      .addCase(searchCommunities.fulfilled, (state, action) => {
        state.discoveredCommunities = action.payload;
      })
      .addCase(fetchCommunityMessages.fulfilled, (state, action) => {
        const { communityId, messages } = action.payload;
        if (state.communities[communityId]) {
          state.communities[communityId].messages = messages;
        }
      })
      .addCase(fetchCommunityMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(leaveCommunity.fulfilled, (state, action) => {
        state.joinedCommunities = state.joinedCommunities.filter(
          c => c._id !== action.payload.communityId
        );
        state.discoveredCommunities = [
          ...state.discoveredCommunities,
          state.allCommunities.find(c => c._id === action.payload.communityId)
        ].filter(Boolean);
      }).addCase(deleteCommunity.fulfilled, (state, action) => {
        const deletedId = action.payload._id;
        delete state.communities[deletedId];
      });
  },
});

export const {
  setCurrentCommunity,
  updateCommunityPresence,
  communityUpdated,
  communityDeleted,
  newCommunityMessage,
  receiveCommunityInvite,
} = communitySlice.actions;
export default communitySlice.reducer;
