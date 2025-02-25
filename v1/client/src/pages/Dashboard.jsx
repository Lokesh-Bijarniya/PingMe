import React from "react";
import { MessageCircle, Users, FileText, PhoneCall, Search } from "lucide-react";

const DashboardPage = () => {
  const stats = [
    { title: "Total Messages", value: "12.4K", icon: <MessageCircle className="text-blue-500" /> },
    { title: "Active Users", value: "256", icon: <Users className="text-green-500" /> },
    { title: "Files Shared", value: "1.8K", icon: <FileText className="text-purple-500" /> },
    { title: "Calls Made", value: "632", icon: <PhoneCall className="text-red-500" /> },
  ];

  const recentChats = [
    { id: 1, name: "Alice", message: "Hey! How's it going?", time: "2m ago" },
    { id: 2, name: "Bob", message: "Did you check the files?", time: "10m ago" },
    { id: 3, name: "Charlie", message: "Let's have a call", time: "30m ago" },
  ];

  return (
    <div className="w-full mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 px-4 py-2 border rounded-md focus:ring focus:ring-blue-200"
          />
          <Search className="absolute right-3 top-3 text-gray-500 w-5 h-5" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 bg-white shadow-md rounded-lg flex items-center space-x-4">
            <div className="text-4xl">{stat.icon}</div>
            <div>
              <h3 className="text-xl font-semibold">{stat.value}</h3>
              <p className="text-gray-500">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Chats */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Chats</h3>
        <div className="divide-y">
          {recentChats.map((chat) => (
            <div key={chat.id} className="flex justify-between items-center py-3">
              <div>
                <h4 className="text-lg font-medium">{chat.name}</h4>
                <p className="text-gray-500">{chat.message}</p>
              </div>
              <p className="text-gray-400 text-sm">{chat.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
