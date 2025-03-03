import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../api/apiClient";

// ✅ Fetch all chats (with unread count)
export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { chat } = getState();
      if (chat.chats.length > 0) {
        console.log("Chats already loaded, skipping API call.");
        return chat.chats;
      }

      const response = await api.get("/chats");
      console.log("Chats Response:", response);

      return response.map(chat => ({
        chatId: chat.chatId,
        friend: chat.friend,
        lastMessage: chat.lastMessage?.content || "No messages yet",
        unreadCount: chat.unreadCount || 0, // 🔥 Include unread count
        updatedAt: chat.updatedAt,
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch chats");
    }
  }
);

// ✅ Fetch messages for a chat
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${chatId}`);
      console.log("Messages Response:", response);

      return { chatId, messages: response };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch messages");
    }
  }
);

// ✅ Delete a chat
export const deleteChat = createAsyncThunk(
  "chat/deleteChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await api.delete(`/chats/${chatId}`);
      return chatId; // Return the deleted chat ID
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete chat");
    }
  }
);



// ✅ Mark messages as read in the backend
// export const markMessagesAsReadAPI = createAsyncThunk(
//   "chat/markMessagesAsReadAPI",
//   async (chatId, { dispatch, rejectWithValue }) => {
//     try {
//       // console.log("markMessagesAsReadAPI", chatId);
//       await api.put(`/messages/read/${chatId}`); // 🔥 Backend updates unread count
//       // dispatch(fetchChats()); // 🔥 Refetch chats to update unread count

//       return { chatId };
//     } catch (err) {
//       return rejectWithValue(err.response?.data || "Failed to mark messages as read");
//     }
//   }
// );


// ✅ Start a new chat
export const startChatByEmail = createAsyncThunk(
  "chat/startChatByEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/chats", { email });
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to start chat");
    }
  }
);



export const searchUsers = createAsyncThunk(
  "chat/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auth/search?query=${query}`);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to search users");
    }
  }
);

// ✅ Update message status (mark as read)
export const updateMessageStatus = createAsyncThunk(
  "chat/updateMessageStatus",
  async ({ messageId, chatId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/messages/status/${messageId}`, { status });

      return { chatId, messageId, status };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update message status");
    }
  }
);

// Slice Definition
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [], // List of all chats
    messages: {}, // Messages grouped by chatId
    typingStatus: {}, // Typing indicators
    onlineStatus: {}, // Online status of users
    unreadCounts: {}, // 🔥 Store unread counts per chat
    searchedUsers: [], // Store search results here
    selectedChat: null, // Selected chat
    loadingChats: false,
    loadingMessages: false,
    error: null,
  },
  reducers: {
    // ✅ Handle new message received
    newMessageReceived: (state, action) => {
      const { chatId, message } = action.payload;
      const currentUser = state.auth?.user; // Ensure we get the current user
    
      // ✅ Check if sender exists before accessing id
      if (!message.sender || !message.sender.id) {
        console.error("❌ Received message without sender:", message);
        return;
      }
    
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
    
      if (!state.messages[chatId].some(msg => msg.messageId === message.messageId)) {
        state.messages[chatId] = [...state.messages[chatId], message].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      }
    
      // ✅ Fix unread count logic
      if (message.sender.id !== currentUser?.id) {
        state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
      }
    },
    

    // ✅ Set typing status
    setTypingStatus: (state, action) => {
      const { chatId, isTyping } = action.payload;
      state.typingStatus[chatId] = isTyping;
    },

    // ✅ Update user online status
    updateOnlineStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      state.onlineStatus[userId] = isOnline;
    },

    // ✅ Set selected chat
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
      
      // 🔥 Reset unread count when chat is opened
      if (action.payload?.chatId) {
        state.unreadCounts[action.payload.chatId] = 0;
      }
    },

    clearSearchedUsers: (state) => {
      state.searchedUsers = [];
    },
    

    // ✅ Mark all messages in a chat as read
    // markMessagesAsRead: (state, action) => {
    //   const { chatId } = action.payload;
    //   state.unreadCounts[chatId] = 0;
    // },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Chats
      .addCase(fetchChats.pending, (state) => {
        state.loadingChats = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
        state.unreadCounts = action.payload.reduce((acc, chat) => {
          acc[chat.chatId] = chat.unreadCount;
          return acc;
        }, {});
        state.loadingChats = false;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loadingChats = false;
        state.error = action.payload || "Failed to fetch chats";
      })

      // ✅ Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        state.loadingMessages = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload || "Failed to fetch messages";
      })

      // ✅ Start Chat by Email
      .addCase(startChatByEmail.fulfilled, (state, action) => {
        const { chatId, recipient } = action.payload;

        if (!state.chats.some(chat => chat.chatId === chatId)) {
          state.chats.push({
            chatId,
            friend: recipient,
            lastMessage: "No messages yet",
            unreadCount: 0,
            updatedAt: new Date(),
          });
        }
      })
      .addCase(startChatByEmail.rejected, (state, action) => {
        state.error = action.payload || "Failed to start chat";
      })

      // ✅ Update Message Status (Mark as Read)
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        const { chatId, messageId, status } = action.payload;

        if (status === "read") {
          state.unreadCounts[chatId] = 0; // 🔥 Reset unread count
        }

        if (state.messages[chatId]) {
          state.messages[chatId] = state.messages[chatId].map(msg =>
            msg.messageId === messageId ? { ...msg, status } : msg
          );
        }
      })
      // ✅ Handle delete chat success
    .addCase(deleteChat.fulfilled, (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.filter((chat) => chat.chatId !== chatId);
      delete state.messages[chatId];
      delete state.unreadCounts[chatId];

      // ✅ Close chat window if the deleted chat was selected
      if (state.selectedChat?.chatId === chatId) {
        state.selectedChat = null;
      }
    })
    .addCase(deleteChat.rejected, (state, action) => {
      state.error = action.payload || "Failed to delete chat";
    }) 
    .addCase(searchUsers.fulfilled, (state, action) => {
      state.searchedUsers = action.payload;
    })
    .addCase(searchUsers.rejected, (state, action) => {
      state.error = action.payload || "Failed to search users";
    });
  },
});

// Export actions
export const {
  newMessageReceived,
  setTypingStatus,
  updateOnlineStatus,
  setSelectedChat,
  markMessagesAsRead,
  clearSearchedUsers
} = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
