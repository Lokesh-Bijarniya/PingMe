import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { Home, MessageCircle, Users, Settings, LogOut } from "lucide-react";
import { logoutUser } from "../redux/features/auth/authSlice";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // State for screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Listen to screen width changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: <Home />, path: "/" },
    { name: "Messages", icon: <MessageCircle />, path: "/chat" },
    { name: "Community", icon: <Users />, path: "/community" },
    { name: "Settings", icon: <Settings />, path: "/settings" },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <>
      {/* Sidebar for large screens (md and above) */}
      {!isMobile && (
        <div className="h-full w-60 bg-gray-100 flex flex-col items-center shadow-md md:w-72 lg:w-1/5 border border-gray-300">
          <h2 className="text-lg font-bold w-full p-2 bg-white border-b border-gray-300">
            <img src="/Logo.png" alt="Logo" className="w-full h-20" />
          </h2>
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
          <div className="mt-auto flex gap-2 items-center justify-between px-8 py-4 w-full hover:bg-gray-200 cursor-pointer border-t border-gray-300">
            <div className="flex items-center gap-2">
              <img
                src={user?.avatar || "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg"}
                alt="User"
                className="rounded-full w-8 h-8"
              />
              <h1 className="font-medium">{user?.name || "Guest"}</h1>
            </div>
            <LogOut className="text-red-500 cursor-pointer" onClick={handleLogout} />
          </div>
        </div>
      )}

      {/* Bottom Navbar for small screens (sm and below) */}
      {isMobile && (
        <div className="fixed z-10 bottom-0 left-0 w-full bg-white shadow-md flex justify-around items-center p-3 border-t border-gray-300">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.path} className="flex flex-col items-center">
              <div
                className={`p-2 rounded-full ${
                  location.pathname === item.path ? "bg-gray-300" : "hover:bg-gray-200"
                }`}
              >
                {item.icon}
              </div>
            </Link>
          ))}
          {/* Logout Icon */}
          <div onClick={handleLogout} className="p-2 rounded-full text-red-500 cursor-pointer hover:bg-gray-200">
            <LogOut />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
