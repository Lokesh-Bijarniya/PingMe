import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SocketService from "./services/socket";
import { setupSocketListeners, cleanupSocketListeners } from "./services/socketListeners";

// Components
import Sidebar from "./components/Sidebar";
import AuthPage from "./pages/Auth";
import ChatPage from "./pages/ChatPage";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import CommunityPage from "./pages/CommunityPage";
import CallPage from "./pages/CallPage";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.chat);
  const location = useLocation();

  // Handle WebSocket connection and listeners
  useEffect(() => {
    if (isAuthenticated && token) {
      SocketService.disconnect();
      SocketService.connect(token);
      setupSocketListeners(dispatch);

      return () => {
        cleanupSocketListeners();
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

  // Handle email verification success message
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const verified = queryParams.get("verified");
    if (verified === "true") {
      alert("Your email has been verified. You can now log in.");
    }
  }, [location.search]);

  // Redirect verified users away from AuthPage
  if (isAuthenticated && location.pathname.startsWith("/auth")) {
    return <Navigate to="/" replace/>;
  }

  return (
    <div className="flex h-screen">
      {/* Show Sidebar only if the user is authenticated */}
      {isAuthenticated && <Sidebar />}
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden`}>
        <Routes>

          {/* Protected routes (Only accessible if authenticated) */}
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/call" element={<CallPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/community" element={<CommunityPage />} />
            </>
          ) : null}

          {/* Authentication routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </div>

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;

