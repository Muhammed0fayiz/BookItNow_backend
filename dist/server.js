"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("./config/passport"));
const passport_2 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./presentation/routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./presentation/routes/adminRoutes"));
const performerRoutes_1 = __importDefault(require("./presentation/routes/performerRoutes"));
const performerEvent_1 = __importDefault(require("./presentation/routes/performerEvent"));
const paymentRoutes_1 = __importDefault(require("./presentation/routes/paymentRoutes"));
const chatRoutes_1 = __importDefault(require("./presentation/routes/chatRoutes"));
const userEvent_1 = __importDefault(require("./presentation/routes/userEvent"));
const morgan = require("morgan");
const dbConnection_1 = require("./infrastructure/db/dbConnection");
const reminder_1 = require("./shared/utils/reminder");
const eventunblock_1 = require("./shared/utils/eventunblock");
const logger_1 = __importDefault(require("./shared/utils/logger"));
const cron = require("node-cron");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    "https://www.bookitnow.shop",
    "https://bookitnow.shop",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: "GET,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // Add this line to explicitly allow these headers
};
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions)); // Enable preflight requests for all routes
// Middleware setup
app.use(morgan("tiny", {
    stream: { write: (message) => logger_1.default.info(message.trim()) },
}));
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
}));
app.use(express_1.default.json());
// Passport configuration
(0, passport_1.default)();
app.use(passport_2.default.initialize());
app.use(passport_2.default.session());
// Routes
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});
// Cron job for reminders and unblocking events
cron.schedule("13 18 * * *", () => {
    (0, reminder_1.sendReminder)();
    (0, eventunblock_1.unblockExpiredEvents)();
});
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS request headers:', req.headers);
        console.log('OPTIONS request path:', req.path);
    }
    next();
});
app.use("/chat", chatRoutes_1.default);
app.use("/", userRoutes_1.default);
app.use("/performer", performerRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
app.use("/payment", paymentRoutes_1.default);
app.use("/userEvent", userEvent_1.default);
app.use("/performerEvent", performerEvent_1.default);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.use((req, res, next) => {
    req.io = io;
    next();
});
const userSocketMap = {};
io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);
    socket.on("userConnected", (userId) => {
        userSocketMap[userId] = socket.id;
        console.log("🆔 map ", userSocketMap);
        console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    });
    socket.on("sendMessage", (messageData) => {
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
const port = process.env.PORT || 5000;
(0, dbConnection_1.connectDatabase)()
    .then(() => {
    httpServer.listen(port, () => {
        console.log(`Server and Socket.IO are running on port ${port}`);
    });
})
    .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
});
