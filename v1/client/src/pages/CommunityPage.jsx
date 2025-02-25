import React, { useState } from "react";
import CommunityList from "../components/CommunityList";
import CommunityChat from "../components/CommunityChat";

const Community = () => {
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  return (
    <div className="flex h-screen">
      <CommunityList onSelectCommunity={setSelectedCommunity} />
      <CommunityChat selectedCommunity={selectedCommunity} />
    </div>
  );
};

export default Community;
