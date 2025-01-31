// import { Server, Socket } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// interface UserSocketMap {
//   [userId: string]: string;
// }

// interface MessageData {
//   senderId: string;
//   receiverId: string;
//   message: string;
// }

// const userSocketMap: UserSocketMap = {};

// io.on("connection", (socket: Socket) => {
//   console.log(`New connection: ${socket.id}`);

//   socket.on("userConnected", (userId: string) => {
//     userSocketMap[userId] = socket.id;
//     console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
//   });

//   socket.on("sendMessage", (messageData: MessageData) => {
//     const { senderId, receiverId, message } = messageData;
//     const receiverSocketId = userSocketMap[receiverId];
//     console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

//     if (receiverSocketId) {
//       io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
//     }
//   });

//   socket.on("disconnect", () => {
//     for (const userId in userSocketMap) {
//       if (userSocketMap[userId] === socket.id) {
//         delete userSocketMap[userId];
//         console.log(`User ${userId} disconnected`);
//         break;
//       }
//     }
//   });
// });

// ;
// export { app, io, server };