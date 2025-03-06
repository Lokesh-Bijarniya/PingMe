import React from "react";
import { Video, PhoneCall, Clock, RefreshCw, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle, AlertTriangle, Hourglass } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";

const ContactsList = ({ callHistory = [], onStartCall }) => {
  const { user } = useSelector((state) => state.auth); // ✅ Get current user

  // Ensure callHistory is always an array
  const safeCallHistory = Array.isArray(callHistory) ? callHistory : [];

  const activeStatuses = ["pending", "accepted"];

  // Filter out active calls
  const filteredHistory = safeCallHistory.filter((call) =>
    !activeStatuses.includes(call.status)
  );

  return (
    <div>
      <h2>Recent Calls</h2>

      {filteredHistory.length === 0 ? (
        <p>No recent calls</p>
      ) : (
        filteredHistory.map((call) => {
          // Determine if the user was the caller or recipient
          const isCaller = call.callerId?._id === user._id;
          const recipient = isCaller ? call.receiverId : call.callerId;

          // Show "Incoming" only if the call was accepted, otherwise show "Missed Call"
          let callLabel = isCaller ? "Outgoing" : call.status === "accepted" ? "Incoming" : "Missed Call";
          let callIcon = isCaller ? <ArrowUpRight /> : <ArrowDownLeft />;
          let statusColor = "text-gray-500"; // Default color

          // Call status with icons
          let statusIcon;
          switch (call.status) {
            case "accepted":
              statusIcon = <CheckCircle />;
              statusColor = "text-green-500";
              break;
            case "rejected":
              statusIcon = <XCircle />;
              statusColor = "text-red-500";
              break;
            case "missed":
              statusIcon = <AlertTriangle />;
              statusColor = "text-yellow-500";
              break;
            default: // Pending status
              statusIcon = <Hourglass />;
              statusColor = "text-gray-500";
              break;
          }

          return (
            <div key={call._id} className="flex items-center justify-between p-2 border-b">
              <div>
                <p>{recipient?.name || "Unknown"}</p>
                <p className="text-sm text-gray-500">
                  {callIcon} {statusIcon} {callLabel}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(call.createdAt || call.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <div>
                {call.type === "audio" ? (
                  <PhoneCall className="text-blue-500" />
                ) : (
                  <Video className="text-green-500" />
                )}
              </div>
              {/* Redial Button */}
              <button
                onClick={() => onStartCall(recipient, call.type)}
                className="p-2 cursor-pointer text-gray-600 hover:bg-gray-200 rounded-full"
              >
                <RefreshCw />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ContactsList;