import React from "react";
import { Link } from "react-router-dom";
import { Home, MessageCircle, Users, Settings, LogOut, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../redux/features/auth/authSlice";

const MobileSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    { name: "Dashboard", icon: <Home />, path: "/" },
    { name: "Messages", icon: <MessageCircle />, path: "/chat" },
    { name: "Community", icon: <Users />, path: "/community" },
    { name: "Settings", icon: <Settings />, path: "/settings" },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    onClose(); // Close sidebar after logout
  };

  return (
    <>
      {/* Background Overlay - Click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-50 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close Button */}
        <button className="p-3 flex items-center justify-between border-b border-gray-200" onClick={onClose}>
          <span className="text-lg font-semibold">Menu</span>
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Menu Items */}
        <nav className="flex flex-col p-4 space-y-3">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.path} onClick={onClose} className="flex items-center p-3 hover:bg-gray-200 rounded">
              <div className="mr-3">{item.icon}</div>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="mt-auto flex items-center gap-2 px-4 py-4 border-t border-gray-300 hover:bg-gray-200 cursor-pointer" onClick={handleLogout}>
          <img
            src={user?.avatar || "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg"}
            alt="User"
            className="rounded-full w-8 h-8"
          />
          <h1 className="font-medium">{user?.name || "Guest"}</h1>
          <LogOut className="text-red-500 ml-auto" />
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
