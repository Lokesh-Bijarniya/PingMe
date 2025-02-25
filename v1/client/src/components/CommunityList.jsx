import React, { useState } from "react";
import { MessageCircle, Search, Plus, Bell, CheckCircle } from "lucide-react";

const CommunityList = ({ onSelectCommunity }) => {
  const [joinedCommunities, setJoinedCommunities] = useState([]);

  const communities = [
    { id: 1, name: "React Developers", members: "12K Members", image: "https://via.placeholder.com/150" },
    { id: 2, name: "JavaScript Enthusiasts", members: "8K Members", image: "https://via.placeholder.com/150" },
    { id: 3, name: "Tailwind CSS Wizards", members: "5K Members", image: "https://via.placeholder.com/150" },
    { id: 4, name: "Full-Stack Devs", members: "10K Members", image: "https://via.placeholder.com/150" },
  ];

  const toggleJoin = (id) => {
    setJoinedCommunities((prev) =>
      prev.includes(id) ? prev.filter((communityId) => communityId !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-2/5 p-4 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Communities</h2>
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <Plus className="mr-2" /> Create Community
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search communities..."
          className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200"
        />
        <Search className="absolute right-3 top-3 text-gray-500 w-5 h-5" />
      </div>

      {/* Community List */}
      <div className="space-y-4">
        {communities.map((community) => (
          <div key={community.id} className="bg-white shadow-md rounded-lg overflow-hidden p-4">
            <h3 className="text-lg font-semibold">{community.name}</h3>
            <p className="text-sm text-gray-500">{community.members}</p>

            {joinedCommunities.includes(community.id) ? (
              <button
                className="mt-3 px-4 py-2 flex items-center justify-center bg-green-500 text-white rounded-md w-full hover:bg-green-600"
                onClick={() => onSelectCommunity(community)}
              >
                <MessageCircle className="w-5 h-5 mr-2" /> Open Chat
              </button>
            ) : (
              <button
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600"
                onClick={() => toggleJoin(community.id)}
              >
                Join
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityList;
