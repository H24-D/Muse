const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { resource_type: "video", folder: "muse-audio" },
});

const upload = multer({ storage });
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"], credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

app.post("/upload", upload.single("audio"), (req, res) => {
  console.log("Upload request received");
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  console.log("File uploaded:", req.file.path);
  res.json({ url: req.file.path, filename: req.file.originalname });
});

const roomState = {};
const roomUsers = {};
const roomSettings = {};

const cleanupRoom = (roomId, userName, notify = true) => {
  if (!roomUsers[roomId]) return;
  const remaining = Object.keys(roomUsers[roomId]).length;
  if (remaining === 0) {
    delete roomUsers[roomId];
    delete roomSettings[roomId];
    delete roomState[roomId];
    console.log(`Room ${roomId} cleaned up`);
  } else if (notify) {
    io.to(roomId).emit("room-users", Object.values(roomUsers[roomId]));
    io.to(roomId).emit("user-left", userName);
  }
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (roomId, userName, password, maxUsers) => {
    const isNewRoom = !roomSettings[roomId];

    if (isNewRoom) {
      roomSettings[roomId] = {
        password: password || null,
        maxUsers: maxUsers || null,
      };
    } else {
      if (roomSettings[roomId].password && roomSettings[roomId].password !== password) {
        socket.emit("join-error", "❌ Wrong password!");
        return;
      }
      const currentUsers = Object.keys(roomUsers[roomId] || {}).length;
      if (roomSettings[roomId].maxUsers && currentUsers >= roomSettings[roomId].maxUsers) {
        socket.emit("join-error", "❌ Room is full!");
        return;
      }
    }

    socket.join(roomId);
    socket.data.room = roomId;
    socket.data.name = userName;

    if (!roomUsers[roomId]) roomUsers[roomId] = {};
    roomUsers[roomId][socket.id] = userName;

    socket.to(roomId).emit("user-joined", userName);
    io.to(roomId).emit("room-users", Object.values(roomUsers[roomId]));

    if (roomState[roomId]) {
      setTimeout(() => {
        socket.emit("room-state", roomState[roomId]);
      }, 600);
    }
  });

  socket.on("leave-room", (roomId) => {
    const userName = socket.data.name;
    socket.leave(roomId);
    socket.data.room = null;
    socket.data.name = null;

    if (roomId && roomUsers[roomId]) {
      delete roomUsers[roomId][socket.id];
      cleanupRoom(roomId, userName, true);
    }
  });

  socket.on("audio-loaded", ({ room, url, filename }) => {
    if (!roomState[room]) roomState[room] = {};
    roomState[room].url = url;
    roomState[room].filename = filename;
    roomState[room].playing = false;
    roomState[room].progress = 0;
    socket.to(room).emit("audio-loaded", { url, filename });
  });

  socket.on("play", (roomId) => {
    if (roomState[roomId]) roomState[roomId].playing = true;
    socket.to(roomId).emit("play");
  });

  socket.on("pause", (roomId) => {
    if (roomState[roomId]) roomState[roomId].playing = false;
    socket.to(roomId).emit("pause");
  });

  socket.on("seek", ({ room, progress }) => {
    if (roomState[room]) roomState[room].progress = progress;
    socket.to(room).emit("seek", progress);
  });

  socket.on("chat", ({ room, name, msg }) => io.to(room).emit("chat", { name, msg }));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    const roomId = socket.data.room;
    const userName = socket.data.name;
    if (roomId && roomUsers[roomId]) {
      delete roomUsers[roomId][socket.id];
      cleanupRoom(roomId, userName, true);
    }
  });
});

server.listen(process.env.PORT || 5000, () => console.log("Server running"));
