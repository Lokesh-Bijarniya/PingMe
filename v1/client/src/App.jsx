import React from "react";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatPage from "./pages/ChatPage";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import CommunityPage from "./pages/CommunityPage";
import CallPage from "./pages/CallPage";
import AuthPage from "./pages/Auth"; 

const App = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);


  if (!isAuthenticated) {
    return <AuthPage />; // Show only the AuthPage if not logged in
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
    </div>
  );
};

export default App;
