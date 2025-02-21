export function initSocket(io) {
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
  
      // Handle receiving a message from the client
      socket.on('user-message', (message) => {
        console.log(`User message: ${message}`);
        // Broadcast the message to all connected clients
        io.emit('user-message', message);
      });
  
      // Handle user disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }
  