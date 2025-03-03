import React from "react";
import { Video, PhoneCall, Clock, RefreshCw, ArrowDownLeft, ArrowUpRight, CheckCircle, XCircle, AlertTriangle, Hourglass } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";

const ContactsList = ({ callHistory = [], onStartCall }) => {
  const { user } = useSelector((state) => state.auth); // ✅ Get current user

  // console.log(callHistory);

  const activeStatuses = ['pending', 'accepted'];
  
  const filteredHistory = callHistory.filter(call => 
    !activeStatuses.includes(call.status)
  );
  

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Calls</h2>
      <div className="space-y-2">
        {filteredHistory.length === 0 ? (
          <p className="text-gray-500 text-center">No recent calls</p>
        ) : (
          filteredHistory.map((call) => {
            // ✅ Determine if the user was the caller or recipient
            const isCaller = call.callerId._id === user._id;
            const recipient = isCaller ? call.recipientId : call.callerId;

            // ✅ Show "Incoming" only if the call was accepted, otherwise show "Missed Call"
            let callLabel = isCaller ? "Outgoing" : call.status === "accepted" ? "Incoming" : "Missed Call";
            let callIcon = isCaller ? <ArrowUpRight className="w-4 h-4 text-blue-500" /> : <ArrowDownLeft className="w-4 h-4 text-green-500" />;
            let statusColor = "text-gray-500"; // Default color

            // ✅ Call status with icons
            let statusIcon
            switch (call.status) {
              case "accepted":
                statusIcon = <CheckCircle className="w-4 h-4 text-green-500" />;
                statusColor = "text-green-500";
                break;
              case "rejected":
                statusIcon = <XCircle className="w-4 h-4 text-red-500" />;
                statusColor = "text-red-500";
                break;
              case "missed":
                statusIcon = <AlertTriangle className="w-4 h-4 text-yellow-500" />;
                statusColor = "text-yellow-500";
                break;
              default: // Pending status
                statusIcon = <Hourglass className="w-4 h-4 text-gray-400" />;
                statusColor = "text-gray-500";
                break;
            }

            return (
              <div
                key={call._id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={recipient?.avatar || "https://via.placeholder.com/50"}
                      alt={recipient?.name || "Unknown"}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{recipient?.name || "Unknown"}</h3>
                    <p className={`text-sm flex items-center gap-1 ${statusColor}`}>
                      {callIcon} {statusIcon} {callLabel}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(call.createdAt || call.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {call.type === "audio" ? (
                    <PhoneCall className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Video className="w-5 h-5 text-green-500" />
                  )}

                  {/* ✅ Redial Button - Starts a New Call Request */}
                  <button
                    onClick={() => onStartCall(recipient, call.type)}
                    className="p-2 cursor-pointer text-gray-600 hover:bg-gray-200 rounded-full"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ContactsList;
