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

      return response.map((chat) => ({
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

      console.log("📩 Messages Response:", response);

      // ✅ Normalize messages format
      const formattedMessages = response.map((message) => ({
        messageId: message._id,
        content: message.attachment ? "" : message.content, // Empty content if file exists
        sender: message.sender,
        timestamp: message.timestamp,
        attachment: message.attachment || null, // ✅ Store file URL
        fileType: message.fileType || null,
        fileName: message.fileName || null,
      }));

      return { chatId, messages: formattedMessages };
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

// ✅ Start a new chat
export const startChatByEmail = createAsyncThunk(
  "chat/startChatByEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/chats", { email });

      if (!response || !response.chatId) {
        console.warn("⚠️ API returned an invalid response:", response);
        return rejectWithValue("Invalid response from server");
      }

      return response; // ✅ Return only `data`, not full response
    } catch (err) {
      console.error("🔥 Error starting chat:", err.response?.data || err.message);
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
      await api.put(`/messages/status/${messageId}`, { status });

      return { chatId, messageId, status };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update message status");
    }
  }
);

// ✅ Slice Definition
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

      console.log("chat-slice",message);

      // 🔥 Find the chat
      const chat = state.chats.find((c) => c.chatId === chatId);
      if (chat) {
        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }

        state.messages[chatId].push({
          messageId: message.messageId,
          content: message.content,
          sender: message.sender,
          timestamp: message.timestamp,
          attachment: message.attachment || null, // ✅ Ensure attachment URL is stored
          fileType: message.fileType || null,
          fileName: message.fileName || null,
        });

        chat.lastMessage = message.content; // ✅ Update last message preview
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
      const { onlineUsers } = action.payload;

      if (!onlineUsers || !Array.isArray(onlineUsers)) {
        console.error("❌ Invalid online users data received:", onlineUsers);
        return;
      }

      state.onlineStatus = {}; // ✅ Reset online status
      onlineUsers.forEach((userId) => {
        if (userId) {
          state.onlineStatus[userId] = true; // ✅ Store each online user
        }
      });
    },

    // ✅ Set selected chat
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
      if (action.payload?.chatId) {
        state.unreadCounts[action.payload.chatId] = 0; // 🔥 Reset unread count
      }
    },

    clearSearchedUsers: (state) => {
      state.searchedUsers = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
        state.unreadCounts = action.payload.reduce((acc, chat) => {
          acc[chat.chatId] = chat.unreadCount;
          return acc;
        }, {});
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.messages[chatId] = messages.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        const chatId = action.payload;
        state.chats = state.chats.filter((chat) => chat.chatId !== chatId);
        delete state.messages[chatId];
        delete state.unreadCounts[chatId];
        if (state.selectedChat?.chatId === chatId) {
          state.selectedChat = null;
        }
      });
  },
});

// ✅ Export actions
export const {
  newMessageReceived,
  setTypingStatus,
  updateOnlineStatus,
  setSelectedChat,
  clearSearchedUsers,
} = chatSlice.actions;

// ✅ Export reducer
export default chatSlice.reducer;
