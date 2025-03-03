import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Home, Phone, MessageCircle, Users, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { logout } from "../redux/features/auth/authSlice"; // Import your logout action

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Retrieve user details from Redux state
  const { user } = useSelector((state) => state.auth);

  console.log("user",user);

  const menuItems = [
    { name: "Dashboard", icon: <Home />, path: "/" },
    // { name: "Analytics", icon: <BarChart2 />, path: "/analytics" },
    // { name: "Files", icon: <File />, path: "/files" },
    { name: "Messages", icon: <MessageCircle />, path: "/chat" },
    { name: "Community", icon: <Users />, path: "/community" },
    { name: "Call", icon: <Phone />, path: "/call" },
    { name: "Settings", icon: <Settings />, path: "/settings" },
  ];

  const handleLogout = () => {
    dispatch(logout()); // Dispatch logout action
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="h-full w-60 bg-gray-100 flex flex-col items-center shadow-md md:w-72 lg:w-1/5 border border-gray-300">
      <h2 className="text-lg font-bold w-full py-6 px-8 border-b border-gray-300">PingMe</h2>
      <div className="w-full">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.path} className="block">
            <div
              className={`px-8 py-4 flex items-center w-full rounded-lg cursor-pointer ${
                location.pathname === item.path ? "bg-gray-300" : "hover:bg-gray-200"
              }`}
            >
              <div className="text-xl mr-3">{item.icon}</div>
              <span className="hidden md:inline text-sm font-medium">{item.name}</span>
            </div>
          </Link>
        ))}
      </div>
      <div
        className="mt-auto flex gap-2 items-center justify-between px-8 py-4 w-full hover:bg-gray-200 cursor-pointer border-t border-gray-300"
      >
        <div className="flex items-center gap-2">
          {/* Use user avatar from Redux state */}
          <img
            src={user?.avatar || "https://via.placeholder.com/40"} // Fallback image if no avatar exists
            alt="User"
            className="rounded-full w-8 h-8"
          />
          {/* Use user name from Redux state */}
          <h1 className="font-medium">{user?.name || "Guest"}</h1>
        </div>
        {/* Logout button */}
        <LogOut className="text-red-500" onClick={handleLogout} />
      </div>
    </div>
  );
};

export default Sidebar;