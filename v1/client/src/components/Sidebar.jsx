import React from "react";
import { Home, BarChart2, File, Phone, MessageCircle, Users, Settings, LogOut } from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: <Home /> },
    { name: "Analytics", icon: <BarChart2 /> },
    { name: "Files", icon: <File /> },
    { name: "Call", icon: <Phone /> },
    { name: "Messages", icon: <MessageCircle /> },
    { name: "Community", icon: <Users /> },
    { name: "Settings", icon: <Settings /> },
  ];

  return (
    <div className="h-full w-60 bg-gray-100 p- flex flex-col items-center shadow-md md:w-72 lg:w-1/5  border border-gray-300">
      <h2 className="text-lg font-bold  w-full py-6 px-8 border-b border-gray-300">Dashboard</h2>
      {/* <hr className="w-full" /> */}
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="px-8 py-4 mb- flex items-center w-full hover:bg-gray-200 rounded-lg cursor-pointer"
        >
          <div className="text-xl mr-3">{item.icon}</div>
          <span className="hidden md:inline text-sm font-medium">{item.name}</span>
        </div>
      ))}
      <div className="mt-auto flex gap-2 items-center justify-between px-8 py-4 w-full hover:bg-gray-200 cursor-pointer border-t border-gray-300">
        <div className="flex items-center gap-2 ">
          <img
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
          alt="User"
          className="rounded-full w-10 h-10"
        />
        <h1 className="font-medium">John Doe</h1>
        </div>
        
        <LogOut className="text-red-500"/>
      </div>
    </div>
  );
};

export default Sidebar;
