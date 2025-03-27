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
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token} = useSelector((state) => state.auth);
  const location = useLocation();

  // WebSocket connection and event listeners
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log("🔌 Connecting WebSocket...");
      SocketService.connect(token);
      setupSocketListeners(dispatch);
  
      return () => {
        console.log("🔌 Disconnecting WebSocket...");
        cleanupSocketListeners(dispatch);
        SocketService.disconnect();
      };
    }
  }, [isAuthenticated, token, dispatch]);


  useEffect(() => {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);
  
  

  // Handle email verification success message
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("verified") === "true") {
      alert("Your email has been verified. You can now log in.");
    }
  }, [location.search]);

  // Redirect authenticated users away from AuthPage
  if (isAuthenticated && location.pathname.startsWith("/auth")) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen md:h-screen">
      {isAuthenticated && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/community" element={<CommunityPage />} />
            </>
          ) : null}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;
