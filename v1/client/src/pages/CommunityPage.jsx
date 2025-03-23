import React, { useState } from "react";
import CommunityList from "../components/community/CommunityList";
import CommunityChat from "../components/community/CommunityChat";
import CreateCommunityForm from "../components/community/CommunityForm"; 
import { motion } from "framer-motion"

const Community = () => {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Community List */}
      <CommunityList 
        onSelectCommunity={(community) => {
          setSelectedCommunity(community);
          setShowCreateForm(false); // Ensure chat opens instead of form
        }} 
        onShowCreateForm={() => {
          setShowCreateForm(true);
          setSelectedCommunity(null); // Ensure form opens instead of chat
        }} 
      />

      {/* Right Section - Chat or Create Community */}
      <div className="flex-1 flex items-center justify-center  bg-white shadow-md rounded-lg">
        {showCreateForm ? (
          <CreateCommunityForm onClose={() => setShowCreateForm(false)} />
        ) : selectedCommunity ? (
          <CommunityChat community={selectedCommunity} />
        ) : (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center text-gray-600 text-lg"
    >
      {/* Logo with bounce effect */}
      <motion.img
        src="../../public/logoAuth.png"
        alt="Chat"
        className="mx-auto mb-4 w-28 h-28"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeInOut", repeat: 2, repeatType: "reverse" }}
      />

      {/* Animated text with floating effect */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        className="text-xl font-semibold text-gray-700"
      >
        Select a community to start chatting 🚀
      </motion.p>
    </motion.div>

        )}
      </div>
    </div>
  );
};

export default Community;
