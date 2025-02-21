import api from "./api";


// User Signup API
export const signupUser = async (userData) => {
    const response = await api.post("/users/signup", userData); // Assuming the endpoint is `/users/signup`
    return response.data;
  };

// User Login API
export const loginUser = async (credentials) => {
  const response = await api.post("/users/login", credentials);
  return response.data;
};

// Get Conversations
export const fetchConversations = async () => {
  const response = await api.get("/conversations");
  return response.data;
};

// Get Messages in a Conversation
export const fetchMessages = async (conversationId) => {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
};

// Send a New Message
export const sendMessage = async (conversationId, message) => {
  const response = await api.post(`/messages`, { conversationId, text: message });
  return response.data;
};
