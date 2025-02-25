import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: [
    { id: 1, name: "Odama Studio", lastMessage: "Mas Happy Typing...", time: "05:11 PM", unread: true },
    { id: 2, name: "Hatypo Studio", lastMessage: "Lahh gas!", time: "04:01 PM", unread: false },
    { id: 3, name: "Nolaaa", lastMessage: "Keren banget", time: "03:29 PM", unread: true },
  ],
  selectedChat: null, // Stores the selected chat
  messages: {}, // Stores messages per chat { chatId: [messages] }
  isLoading: false, // Loading state for messages
  error: null, // To handle errors
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedChat: (state, action) => {
      const chat = action.payload;
      state.selectedChat = chat;
      
      // Mark the chat as read
      const chatIndex = state.chats.findIndex((c) => c.id === chat.id);
      if (chatIndex !== -1) {
        state.chats[chatIndex].unread = false;
      }

      // Load messages for the selected chat
      state.messages = state.messages[chat.id] || [];
    },

    addChat: (state, action) => {
      const newChat = action.payload;
      state.chats.push(newChat);
    },

    addMessage: (state, action) => {
      const { chatId, sender, text } = action.payload;
      const newMessage = {
        sender,
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      state.messages[chatId].push(newMessage);

      // Update lastMessage in the chat list
      const chatIndex = state.chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = text;
        state.chats[chatIndex].time = newMessage.time;
      }
    },

    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setSelectedChat, addChat, addMessage, setMessages, setLoading, setError } =
  chatSlice.actions;

export default chatSlice.reducer;
