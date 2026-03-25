# 🎵 Muse — Listen Together

A real-time collaborative music listening app. Upload a song and listen in sync with friends — no matter where they are.

## 📸 Screenshots

### Login Page
![Login Page](Muse/login.png)

### Room — Desktop
![Desktop Room](Muse/audio.png)

### Room — Mobile
![Mobile Room](Muse/mobile.jpeg)

## ✨ Features

- 🎧 **Synced playback** — Play, pause, and seek in sync across all devices
- 🌊 **Waveform visualizer** — See the audio waveform with live progress bar
- 💬 **Live chat** — Chat with emoji support while listening
- 👥 **Who's listening** — See everyone in the room in real time
- 🔒 **Password protection** — Lock your room with a password
- 👤 **Max users** — Limit how many people can join
- 🔗 **Shareable links** — Share a link with room ID pre-filled
- 📱 **Responsive** — Works on mobile and desktop
- ☁️ **Cloud audio** — Audio uploaded to Cloudinary, no file size limits

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Tailwind CSS, WaveSurfer.js |
| Backend | Node.js, Express, Socket.IO |
| Audio Storage | Cloudinary |
| Deploy (Frontend) | Vercel |
| Deploy (Backend) | Render |

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/H24-D/Muse.git
cd Muse
```

### 2. Install dependencies
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 3. Set up environment variables

**Frontend** — create `client/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

**Backend** — create `server/.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

### 4. Run locally
```bash
# Start backend
cd server
node index.js

# Start frontend (new terminal)
cd client
npm start
```

## 🌐 Deployment

| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Frontend hosting |
| [Render](https://render.com) | Backend hosting |
| [Cloudinary](https://cloudinary.com) | Audio file storage |

## 📱 How to Use

1. Open the app and enter a **Room ID** and your **name**
2. Optionally set a **password** or **max users**
3. Click **Join Room**
4. **Upload an audio file** — it syncs to everyone in the room
5. Hit **Play** — everyone hears it at the same time
6. **Share the room link** so friends can join with the ID pre-filled

## 📁 Project Structure
```
Muse/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioPlayer.jsx
│   │   │   ├── ChatBox.jsx
│   │   │   ├── RoomForm.jsx
│   │   │   └── ServerWakeup.jsx
│   │   ├── App.jsx
│   │   └── socket.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js
│   └── package.json
├── screenshots/
│   ├── login.png
│   ├── audio.png
│   └── mobile.jpeg
└── README.md
```

## ⚠️ Notes

- Render free tier spins down after inactivity — first load may take ~30 seconds
- Room data is cleared from memory when all users leave
- Audio files are stored permanently on Cloudinary

## 🔗 Live Demo

[https://muse-app24.vercel.app](https://muse-app24.vercel.app)

## 📄 License

MIT — feel free to use and modify!
