import React from "react";
import { BarChart, Bar, LineChart, Line } from "recharts";
import { Users, MessageCircle, PhoneCall, FileText } from "lucide-react";

const AnalyticsPage = () => {
  const stats = [
    { title: "Total Users", value: "2.4K", icon: <Users className="text-blue-500" /> },
    { title: "Messages Sent", value: "58K", icon: <MessageCircle className="text-green-500" /> },
    { title: "Calls Made", value: "12.5K", icon: <PhoneCall className="text-red-500" /> },
    { title: "Files Shared", value: "7.2K", icon: <FileText className="text-purple-500" /> },
  ];

  const messageData = [
    { month: "Jan", messages: 8000 },
    { month: "Feb", messages: 9500 },
    { month: "Mar", messages: 11000 },
    { month: "Apr", messages: 10500 },
    { month: "May", messages: 12000 },
    { month: "Jun", messages: 14000 },
  ];

  const callData = [
    { month: "Jan", calls: 2000 },
    { month: "Feb", calls: 2500 },
    { month: "Mar", calls: 3200 },
    { month: "Apr", calls: 2800 },
    { month: "May", calls: 3500 },
    { month: "Jun", calls: 4200 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <h2 className="text-3xl font-bold mb-6">Analytics Dashboard</h2>

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

      {/* Messages Sent Chart */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Messages Sent Over Time</h3>
        <LineChart
          width={600}
          height={300}
          data={messageData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <Line type="monotone" dataKey="messages" stroke="#10B981" />
        </LineChart>
      </div>

      {/* Calls Made Chart */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Calls Made Over Time</h3>
        <BarChart
          width={600}
          height={300}
          data={callData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <Bar dataKey="calls" fill="#EF4444" />
        </BarChart>
      </div>
    </div>
  );
};

export default AnalyticsPage;
