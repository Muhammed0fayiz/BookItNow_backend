import express from "express";
import cors from "cors";
import passportConfig from "./config/passport";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import userRoutes from "./presentation/routes/userRoutes";
import adminRoutes from "./presentation/routes/adminRoutes";
import performerRoutes from "./presentation/routes/performerRoutes";
import performerEventRoutes from "./presentation/routes/performerEvent"
import paymentRoutes from "./presentation/routes/paymentRoutes";
import chatRoutes from "./presentation/routes/chatRoutes";
import userEvent from "./presentation/routes/userEvent"

import { connectDatabase } from "./infrastructure/db/dbConnection";
import { sendReminder } from "./shared/utils/reminder";
import { userEventRepository } from "./infrastructure/repositories/user/event";







const cron = require("node-cron");
// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware setup

app.use(cookieParser());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
cron.schedule("11 15 * * *", () => {
  sendReminder();
});

const allowedOrigins = ["http://localhost:3000"];
const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Passport configuration
passportConfig();
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  req.io = io;
  next();
});
// Routes
app.use('/chat',chatRoutes)
app.use("/", userRoutes);
app.use("/performer", performerRoutes);
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);
app.use("/userEvent",userEvent)
app.use("/performerEvent",performerEventRoutes)
// Socket.IO logic
interface UserSocketMap {
  [userId: string]: string;
}

interface MessageData {
  senderId: string;
  receiverId: string;
  message: string;
}
interface Notication {
  senderId: string;
  receiverId: string;
  count: number;
}
const userSocketMap: UserSocketMap = {};

io.on("connection", (socket: Socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on("userConnected", (userId: string) => {
    userSocketMap[userId] = socket.id;
    console.log("🆔 map ", userSocketMap);
    console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
  });

  socket.on("sendMessage", (messageData: MessageData) => {
    console.log("😏 yup success");
    const { senderId, receiverId, message } = messageData;
    console.log("msg data 🤖", messageData);
    const receiverSocketId = userSocketMap[receiverId];
    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("yougotamsg", { senderId, message });
      io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
    }
  });

  socket.on("disconnect", () => {
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Connect to database and start server
const port = process.env.PORT || 5001;

connectDatabase()
  .then(() => {
    httpServer.listen(port, () => {
      console.log(`Server and Socket.IO are running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });

export { app, io, httpServer };
