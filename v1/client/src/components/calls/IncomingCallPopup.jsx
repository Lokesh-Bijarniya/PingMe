import React from "react";

const IncomingCallPopup = ({ caller, onAccept, onReject }) => {
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 flex items-center space-x-4">
      <img src={caller.callerAvatar} alt={caller.callerName} className="w-10 h-10 rounded-full border-2 border-green-500" />
      <div>
        <p className="font-semibold">{caller.callerName}</p>
        <p className="text-sm text-gray-400">Incoming Call...</p>
      </div>
      <button onClick={onAccept} className="px-3 py-2 bg-green-500 rounded-lg hover:bg-green-600">Accept ✅</button>
      <button onClick={onReject} className="px-3 py-2 bg-red-500 rounded-lg hover:bg-red-600">Reject ❌</button>
    </div>
  );
};

export default IncomingCallPopup;
