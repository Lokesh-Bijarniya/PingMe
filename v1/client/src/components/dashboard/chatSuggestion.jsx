import React, { useState } from "react";
import axios from "axios";
import { FiCopy, FiCheck, FiAlertCircle } from "react-icons/fi"; 
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const ChatSuggestions = () => {
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedIndex(-1), 2000);
    } catch (err) {
      toast.error("Failed to copy!");
    }
  };

  const handleGetSuggestions = async () => {
    if (!message.trim()) return;
  
    setLoading(true);
    setSuggestions([]);
    setError(null);
  
    for (let i = 0; i < 3; i++) { // Retry up to 3 times
      try {
        const response = await axios.post(
          "https://api.edenai.run/v2/llm/chat",
          {
            providers: ["google"],
            model: "gemini-1.5-flash",
            messages: [{ role: "user", content: message }],
            temperature: 0.7,
            max_tokens: 200
          },
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_APP_EDEN_AI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (!response.data.choices) {
          throw new Error("No choices returned from the API");
        }
  
        const result = {
          content: response.data.choices[0].message.content,
          model: response.data.model,
          cost: response.data.cost
        };
  
        setSuggestions([result]);
        return; // Exit loop if successful
      } catch (err) {
        console.error(`Attempt ${i + 1} failed:`, err.response?.data || err.message);
        if (i === 2) {
          setError(err.response?.data?.error?.message || "An error occurred");
          toast.error("Failed to generate suggestions");
        } else {
          await new Promise((res) => setTimeout(res, 3000)); // Wait 3 sec before retrying
        }
      }
    }
  
    setLoading(false);
  };
  

  return (
    <motion.div
      className="bg-white shadow-xl rounded-xl p-6 max-w-2xl h-screen mx-auto mb-6 relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating Animation Background */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-100 rounded-full mix-blend-multiply opacity-40 blur-xl" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-100 rounded-full mix-blend-multiply opacity-40 blur-xl" />
      </motion.div>

      {/* Header Section */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-1">
          AI Chat Assistant
        </h3>
        <p className="text-gray-500 text-sm">Powered by Gemini 1.5 Flash</p>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          className="mb-4 p-4 bg-red-50 rounded-lg flex items-center gap-3"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
        >
          <FiAlertCircle className="text-red-500 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Input & Button Section */}
      <motion.div className="flex gap-3 mb-6">
        <motion.input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setSuggestions([]);
          }}
          placeholder="Type your message here..."
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white outline-none transition-all"
          whileFocus={{ 
            scale: 1.02,
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)"
          }}
        />
        <motion.button
          onClick={handleGetSuggestions}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <motion.span 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ⏳
            </motion.span>
          ) : (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              ✨
            </motion.span>
          )}
          {loading ? "Generating..." : "Generate"}
        </motion.button>
      </motion.div>

      {/* Content Section */}
      {suggestions.length === 0 && !loading ? (
        <motion.div 
          className="text-center py-8 bg-white rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.img
            src="https://img.freepik.com/free-vector/chat-bot-concept-illustration_114360-5412.jpg"
            alt="No suggestions"
            className="w-60 mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          <motion.p 
            className="text-gray-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your AI-generated suggestions will appear here
          </motion.p>
        </motion.div>
      ) : (
        suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            className="mb-10 group relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow flex flex-col h-[330px]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {suggestion.model}
                  </span>
                  <span className="text-sm text-gray-500">
                    Cost: ${suggestion.cost.toFixed(5)}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(suggestion.content, index)}
                  className="text-gray-400 hover:text-blue-500 transition-colors p-2 -m-2"
                >
                  {copiedIndex === index ? (
                    <FiCheck className="w-5 h-5" />
                  ) : (
                    <FiCopy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
              <ReactMarkdown
  components={{
    p: ({ node, ...props }) => <p {...props} className="text-gray-800 text-sm" />,
    strong: ({ node, ...props }) => <strong {...props} className="font-bold" />,
    em: ({ node, ...props }) => <em {...props} className="italic" />,
    ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5" />,
    ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5" />,
    li: ({ node, ...props }) => <li {...props} className="mb-1" />,
    code: ({ node, ...props }) => (
      <code {...props} className="bg-gray-200 px-1 py-0.5 rounded text-sm" />
    ),
    pre: ({ node, ...props }) => (
      <pre {...props} className="bg-gray-100 p-3 rounded-md overflow-x-auto" />
    ),
  }}
>
  {suggestion.content}
</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
};

export default ChatSuggestions;