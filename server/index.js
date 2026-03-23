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
  params: {
    resource_type: "video",
    folder: "muse-audio",
  },
});

const upload = multer({ storage });
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

app.post("/upload", upload.single("audio"), (req, res) => {
  console.log("Upload request received");
  if (!req.file) {
    console.log("No file in request");
    return res.status(400).json({ error: "No file uploaded" });
  }
  console.log("File uploaded:", req.file.path);
  res.json({ url: req.file.path, filename: req.file.originalname });
});

const roomState = {}; // stores audio + play state per room

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log("User", socket.id, "joined room", roomId);
    if (roomState[roomId]) {
      socket.emit("room-state", roomState[roomId]);
    }
  });

  socket.on("audio-loaded", ({ room, url, filename }) => {
    console.log("Audio loaded in room", room, url);
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
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
