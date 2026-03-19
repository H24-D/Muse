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
    // ❌ removed format: "mp3" — causes Cloudinary free tier errors
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

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("audio-loaded", ({ room, url, filename }) => {
    console.log(`Audio loaded in room ${room}: ${url}`);
    socket.to(room).emit("audio-loaded", { url, filename });
  });

  socket.on("play", (roomId) => socket.to(roomId).emit("play"));
  socket.on("pause", (roomId) => socket.to(roomId).emit("pause"));
  socket.on("seek", ({ room, progress }) => socket.to(room).emit("seek", progress));
  socket.on("chat", ({ room, name, msg }) => io.to(room).emit("chat", { name, msg }));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
```

---

After pushing, try uploading and check Render logs for:
```
Upload request received
File uploaded: https://res.cloudinary.com/...
Audio loaded in room 1111: https://...
