import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RoomForm({ onJoin }) {
  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get("room") || "";

  const [room, setRoom] = useState(roomFromUrl);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [maxUsers, setMaxUsers] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generateRoom = () => setRoom(uuidv4().slice(0, 6));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!room || !name) return;
    onJoin(room, name, password, maxUsers ? parseInt(maxUsers) : null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-4">
      <h1 className="text-5xl font-extrabold mb-10 tracking-wide drop-shadow-lg">
        🎵 Muse
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 space-y-6"
      >
        <div>
          <label className="block text-sm font-semibold mb-2">Room ID</label>
          <div className="flex">
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="flex-grow px-4 py-2 rounded-l-md text-white bg-gradient-to-br from-purple-700 to-indigo-700 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-300"
              placeholder="Enter room code"
            />
            <button
              type="button"
              onClick={generateRoom}
              className="bg-gradient-to-br from-pink-400 to-pink-600 text-white px-4 py-2 rounded-r-md font-bold hover:brightness-110 transition"
            >
              🎲
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-md text-white bg-gradient-to-br from-indigo-600 to-blue-600 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Enter your name"
          />
        </div>

        {/* Advanced options toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-indigo-300 hover:text-white transition"
        >
          {showAdvanced ? "▲ Hide" : "▼ Show"} advanced options
        </button>

        {showAdvanced && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">🔒 Room Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md text-white bg-gradient-to-br from-indigo-600 to-blue-600 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Leave blank for no password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">👥 Max Users (optional)</label>
              <input
                type="number"
                min="2"
                max="20"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                className="w-full px-4 py-2 rounded-md text-white bg-gradient-to-br from-indigo-600 to-blue-600 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="No limit"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white font-bold py-3 rounded-lg shadow-md hover:scale-105 transition transform duration-300"
        >
          🚀 Join Room
        </button>
      </form>
    </div>
  );
}
