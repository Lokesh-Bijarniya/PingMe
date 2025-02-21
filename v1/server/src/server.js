import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket/socketHandler.js';
// import morgan from 'morgan';
// import connectDB from './config/db.js';  // MongoDB connection
// import authRoutes from './routes/authRoutes.js';  // Authentication routes
// import chatRoutes from './routes/chatRoutes.js';  // Chat routes
// import messageRoutes from './routes/messageRoutes.js';  // Message routes
// import errorHandler from './middlewares/errorHandler.js';  // Error handler middleware

// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Connect to the database
// connectDB();

// Create HTTP server with Express
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
  },
});

// Initialize Socket.IO
initSocket(io);

// Middleware setup
app.use(cors());
app.use(express.json()); // Parse JSON requests
// app.use(morgan('dev')); // Logging

// Routes
// app.use('/api/auth', authRoutes); // Authentication routes
// app.use('/api/chats', chatRoutes); // Chat-related routes
// app.use('/api/messages', messageRoutes); // Message-related routes

// Error Handling Middleware
// app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
