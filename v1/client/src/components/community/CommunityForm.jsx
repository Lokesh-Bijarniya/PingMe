import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createCommunity } from '../../redux/features/chat/communitySlice';

const CreateCommunityForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!communityName.trim()) {
      return alert("Community name is required!");
    }
  
    try {
      const result = await dispatch(createCommunity({
        name: communityName.trim(),
        description: description.trim()
      }));
  
      if (createCommunity.fulfilled.match(result)) {
        setCommunityName('');
        setDescription('');
        onClose();
      }
    } catch (error) {
      console.error("Creation error:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 className="text-lg font-semibold mb-4">Create a New Community</h2>
      <input
        value={communityName}
        onChange={(e) => setCommunityName(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Community Name"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Description (optional)"
      />
      <div className="flex gap-2">
        <button onClick={handleCreate} className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Create
        </button>
        <button onClick={onClose} className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateCommunityForm;
