import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Users, FileText, PhoneCall, Bell, Mail, MessageSquare } from "lucide-react";
import ChatSuggestions from "../components/chatSuggestion";
import { fetchDashboardStats } from "../redux/features/dashboard/dashboardSlice";

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.dashboard);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, type: 'call', message: 'Missed call from John Doe', timestamp: '2h ago', read: false },
    { id: 2, type: 'chat', message: 'New message in General channel', timestamp: '1h ago', read: true },
    { id: 3, type: 'system', message: 'System update available', timestamp: '30m ago', read: false },
  ]);

  useEffect(() => {
    if (!stats || stats.length === 0) {
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, stats]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[50vh]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <motion.p className="mt-4 text-lg text-gray-600">
          Loading Dashboard...
        </motion.p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-[50vh] text-center"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* ... error content remains same ... */}
      </motion.div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  
  return (
    <motion.div
      className="w-full mx-auto p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <motion.h2
            className="text-3xl font-bold text-gray-900"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            Dashboard
          </motion.h2>
        </div>
        
        {/* Notifications Section */}
        <motion.div
          className="relative"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <motion.button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="p-2 relative bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {isNotificationOpen && (
              <motion.div
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg flex items-start gap-3 ${
                          !notification.read ? 'bg-blue-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {notification.type === 'call' && <PhoneCall className="w-5 h-5 text-blue-500" />}
                          {notification.type === 'chat' && <MessageSquare className="w-5 h-5 text-green-500" />}
                          {notification.type === 'system' && <Mail className="w-5 h-5 text-purple-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700">
                    Mark all as read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Animated Stats Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="p-6 bg-white shadow-lg rounded-xl flex items-center space-x-4"
            whileHover={{ 
              y: -5,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="text-4xl text-gray-700"
              whileHover={{ scale: 1.1 }}
            >
              {getIcon(stat.icon)}
            </motion.div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">
                {stat.value}
              </h3>
              <p className="text-gray-500">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Animated Chat Suggestions Section */}
      <AnimatePresence>
        <motion.div
          key="chat-suggestions"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl transform -skew-y-1 -rotate-1" />
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            whileHover={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <ChatSuggestions />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};


// Function to map stat icons
const getIcon = (iconName) => {
  const iconClass = "w-8 h-8";
  switch (iconName) {
    case "MessageCircle":
      return <MessageCircle className={`text-blue-500 ${iconClass}`} />;
    case "Users":
      return <Users className={`text-green-500 ${iconClass}`} />;
    case "FileText":
      return <FileText className={`text-purple-500 ${iconClass}`} />;
    case "PhoneCall":
      return <PhoneCall className={`text-red-500 ${iconClass}`} />;
    default:
      return <MessageCircle className={`text-gray-500 ${iconClass}`} />;
  }
};

export default DashboardPage;
