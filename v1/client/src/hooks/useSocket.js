import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (url) => {
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize the socket connection
    socketRef.current = io(url);

    // Event listener for incoming messages
    socketRef.current.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on component unmount
    return () => {
      socketRef.current.disconnect();
    };
  }, [url]);

  // Function to send a message
  const sendMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.emit('message', message);
    }
  };

  return { messages, sendMessage };
};

export default useSocket;
