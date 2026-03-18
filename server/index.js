// index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Muse backend is running 🎵");
});

// 🧠 Real-time Socket.IO logic
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  // Join a room
  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} joined room ${roomId}`);
  });

  // Music control
  socket.on("play", (roomId) => {
    socket.to(roomId).emit("play");
  });

  socket.on("pause", (roomId) => {
    socket.to(roomId).emit("pause");
  });

  socket.on("seek", ({ room, progress }) => {
    socket.to(room).emit("seek", progress);
  });

  // Chat
 socket.on('chat', ({ room, name, msg }) => {
    console.log(`[${room}] ${name}: ${msg}`);
    io.to(room).emit('chat', { name, msg });
  });

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
