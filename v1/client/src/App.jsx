import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SocketService from "./services/socket";
import { setupSocketListeners, cleanupSocketListeners } from "./services/socketListeners"; // ✅ Import

// Components
import Sidebar from "./components/Sidebar";
import AuthPage from "./pages/Auth";
import ChatPage from "./pages/ChatPage";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import CommunityPage from "./pages/CommunityPage";
import CallPage from "./pages/CallPage";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.chat);



  useEffect(() => {
    if (isAuthenticated && token) {
      SocketService.connect(token); // ✅ Ensure WebSocket connects
      setupSocketListeners(dispatch); // ✅ Load WebSocket listeners

      return () => {
        cleanupSocketListeners(); // ✅ Remove listeners on unmount
        SocketService.disconnect();
      };
    }
  }, [isAuthenticated, token, dispatch]);

  // 🔄 Join Selected Chat Room
  useEffect(() => {
    if (selectedChat?.chatId) {
      SocketService.emit("JOIN_CHAT", { chatId: selectedChat.chatId });
    }
  }, [selectedChat]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/call" element={<CallPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/auth" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;
