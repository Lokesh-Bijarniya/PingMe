import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCommunities,
  createCommunity,
  setCurrentCommunity,
  joinCommunity,
  searchCommunities,
} from "../redux/features/chat/communitySlice";
import { BadgePlus } from "lucide-react";
import SocketService from "../services/socket";
import { Users } from "lucide-react";
import { format, isYesterday, isToday } from "date-fns";
import { toast } from "react-toastify";

const CommunityList = ({ onSelectCommunity }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { joinedCommunities, discoveredCommunities, loading, error } =
    useSelector((state) => state.community);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", description: "" });

  console.log("joinedCommunities", joinedCommunities);

  useEffect(() => {
    dispatch(fetchCommunities());
  }, [dispatch]);

  const handleJoin = async (communityId) => {
    try {
      const result = await dispatch(joinCommunity(communityId));

      if (result.payload) {
        // Only join socket room if not already member
        // if (!result.payload.isExistingMember) {
        //   SocketService.emit("JOIN_COMMUNITY_CHAT", communityId);
        // }

        toast.success("Community joined successfully!");
       
        onSelectCommunity(result.payload.community);
        dispatch(fetchCommunities()); // Refresh the list
      }
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Failed to join community. Please try again.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);

      try {
        const result = await dispatch(createCommunity(form));
        if (result.payload) {
          toast.success("Community created successfully!");
          onSelectCommunity(result.payload);
          setShowCreateModal(false);
          setFormData({ name: "", description: "" });
          SocketService.emit("JOIN_COMMUNITY_CHAT", result.payload._id);
        }
      } catch (error) {
        toast.error("Error creating community. Please try again.");
        console.error("Create error:", error);
      }
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Only dispatch search for non-empty queries
    if (query.trim()) {
      dispatch(searchCommunities(query));
    } else {
      // Reset to default discovered communities when search is empty
      dispatch(fetchCommunities());
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMMM d 'at' h:mm a");
    }
  };

  return (
    <div className="w-2/5 border-r p-4 bg-gray-50 flex flex-col">
      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create New Community</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Community name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Short description (optional)"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 shadow-md mb-3 text-xl font-extralight py-2"
        >
          <BadgePlus /> Create New Community
        </button>

        <div className="flex items-center gap-3 bg-white shadow-md rounded-lg p-3">
          <input
            value={searchQuery}
            onChange={handleSearch}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="🔍 Search communities..."
          />
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading communities...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          Your Communities
        </h3>
        <div className="space-y-3 mb-6">
          {joinedCommunities.length > 0 ? (
           joinedCommunities
            .slice() // Create a copy to avoid mutating original array
            .sort((a, b) => {
              const aTime = a.chat?.lastMessage?.timestamp || 0;
              const bTime = b.chat?.lastMessage?.timestamp || 0;
              return new Date(bTime) - new Date(aTime); // Descending order
            })
            .map((community) => (
              <div
                key={community._id}
                className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                onClick={() => {
                  onSelectCommunity(community);
                  dispatch(setCurrentCommunity(community));
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users />
                  </div>
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {community.name}
                      </h3>
                      <span className="ml-2 text-gray-400 text-xs">
                        {formatDate(community.chat?.lastMessage?.timestamp || community.createdAt)} 
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">
                      {community.chat?.lastMessage && (
                        <div>
                          {community.chat.lastMessage.sender ? (
                            <p>
                              <span className="font-bold mr-1">
                                {community.chat.lastMessage.sender?.name}:
                              </span>
                               {community.chat.lastMessage.content}
                            </p>
                          ) : (
                            <p>{community.chat.lastMessage.content}</p>
                          )}
                        </div>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">
              <p className="text-lg">
                You're not a member of any community yet.
              </p>
              <p className="text-sm mt-1">
                Find communities that interest you or create your own!
              </p>
            </div>
          )}
        </div>


<h3 className="text-sm font-semibold text-gray-500 mb-2">
  Discover Communities
</h3>

{discoveredCommunities.length > 0 || searchQuery ? (
  <div className="space-y-3">
   {discoveredCommunities
  .slice() // Create a copy to avoid mutating original array
  .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical order
  .map((community) => (
      <div
        key={community._id}
        className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Users />
            </div>
            <div>
              <h3 className="font-semibold">{community.name}</h3>
              <p className="text-sm text-gray-500">
                {community.members?.length} members
              </p>
            </div>
          </div>
          {!joinedCommunities.some(jc => jc._id === community._id) && (
            <button
              onClick={() => {
                handleJoin(community._id);
              }
              }
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center rounded-full"
            >
              <span className="text-sm">JOIN</span>
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="text-center text-gray-500 mt-4 bg-gray-100 p-4 rounded-lg">
    {searchQuery ? (
      <p className="text-sm">No communities found matching your search.</p>
    ) : joinedCommunities.length === 0 ? (
      <p className="text-sm">
        🚀 No communities available yet. Be the first to create one!
      </p>
    ) : (
      <p className="text-sm">
        🎉 You've joined all available communities! Check back later for new ones.
      </p>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default CommunityList;
