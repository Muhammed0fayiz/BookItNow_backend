import { Server, Socket } from 'socket.io';
import http from 'http';
import mongoose from 'mongoose';

// Updated Message interface to match frontend structure
interface Message {
  _id?: string;
  roomId?: string;
  senderId: mongoose.Types.ObjectId | string;
  receiverId: mongoose.Types.ObjectId | string;
  message: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}

const configureSocketIO = (server: http.Server) => {
  // Initialize Socket.IO with comprehensive configuration
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // Frontend origin
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Store connected users
  const connectedUsers = new Map<string, string>();

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    
    // TODO: Implement token verification logic
    // For example, verify JWT token, check user authentication
    if (token) {
      // Decode token, validate user
      next();
    } else {
      next(new Error('Authentication error'));
    }
  });

  // Listen for client connections
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User registration
    socket.on('register', ({ userId }: { userId: string }) => {
      if (userId) {
        // Store socket connection for the user
        connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
        
        // Optional: Broadcast user online status
        socket.broadcast.emit('userOnline', { userId });
      }
    });

    // Send message handler
    socket.on('send-message', (messageData: Message) => {
      try {
        // Validate message data
        if (!messageData.senderId || !messageData.receiverId || !messageData.message) {
          throw new Error('Invalid message format');
        }

        console.log('Message received:', messageData);

        // Find receiver's socket ID
        const receiverSocketId = connectedUsers.get(messageData.receiverId.toString());

        // Prepare message payload
        const messagePayload: Message = {
          ...messageData,
          _id: new mongoose.Types.ObjectId().toString(),
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Emit to receiver if online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message', messagePayload);
        }

        // TODO: Implement message saving to database
        // await saveMessageToDatabase(messagePayload);

      } catch (error) {
        console.error('Message sending error:', error);
        socket.emit('messageSendError', { 
          message: 'Failed to send message', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Remove user from connected users
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          
          // Broadcast user's offline status
          socket.broadcast.emit('userOffline', { userId });
          break;
        }
      }
    });
  });

  return io;
};

export default configureSocketIO;