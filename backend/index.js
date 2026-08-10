require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Database
const connectDB = require("./config/db");

// Models
const Message = require("./models/Message");
const Friend = require("./models/Friend");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Middleware
const socketAuth = require("./middleware/socketAuth");
const errorHandler = require("./middleware/errorHandler");

//socket
const chatSocket = require("./socket/chatSocket");


// =========================
// EXPRESS MIDDLEWARE
// =========================

app.use(cors());

app.use(express.json());


// =========================
// DATABASE
// =========================

connectDB();


// =========================
// ROUTES
// =========================

app.use(authRoutes);
app.use(userRoutes);
app.use(friendRoutes);
app.use(messageRoutes);

app.use(errorHandler);


// =========================
// HTTP SERVER
// =========================

const server = http.createServer(app);


// =========================
// SOCKET.IO
// =========================

const io = new Server(server, {

    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }

});

io.use(socketAuth);

chatSocket(io);


// =========================
// START SERVER
// =========================

server.listen(3000, () => {

    console.log("🚀 Server is running on port 3000");

});