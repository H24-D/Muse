import { useState, useEffect, useCallback } from "react";
import RoomForm from "./components/RoomForm";
import AudioPlayer from "./components/AudioPlayer";
import ChatBox from "./components/ChatBox";
import ServerWakeup from "./components/ServerWakeup";
import socket from "./socket";

function Toast({ message, type }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all
      ${type === "join" ? "bg-green-600" : type === "leave" ? "bg-red-600" : "bg-yellow-600"}`}>
      {message}
    </div>
  );
}

function App() {
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [serverReady, setServerReady] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [joinError, setJoinError] = useState("");

  const handleServerReady = useCallback(() => setServerReady(true), []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    socket.on("room-users", (users) => setRoomUsers(users));
    socket.on("user-joined", (userName) => showToast(`${userName} joined the room 🎉`, "join"));
    socket.on("user-left", (userName) => showToast(`${userName} left the room 👋`, "leave"));
    socket.on("join-error", (msg) => setJoinError(msg));

    return () => {
      socket.off("room-users");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("join-error");
    };
  }, []);

  const handleJoin = (roomId, userName, password, maxUsers) => {
    setJoinError("");
    setRoom(roomId);
    setName(userName);
    localStorage.setItem("userName", userName);
    setJoined(true);
    setTimeout(() => {
      const emit = () => socket.emit("join", roomId, userName, password, maxUsers);
      socket.connected ? emit() : socket.once("connect", emit);
    }, 500);
  };

  if (!serverReady) return <ServerWakeup onReady={handleServerReady} />;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {!joined ? (
        <RoomForm onJoin={handleJoin} error={joinError} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-6xl bg-gray-900 text-white rounded-xl shadow-xl border border-gray-700 p-10 space-y-12">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <h2 className="text-4xl font-bold text-center text-white">
                🎶 Welcome to <span className="text-indigo-400">Muse</span>
              </h2>
              <div className="bg-gray-800 text-indigo-300 px-4 py-2 rounded-lg border border-indigo-500 font-mono text-sm shadow">
                Room ID: <span className="font-semibold">{room}</span>
              </div>
            </div>

            {/* Who's in the room */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-400">🎧 Listening:</span>
              {roomUsers.map((u, i) => (
                <span key={i} className="bg-indigo-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {u}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AudioPlayer room={room} name={name} />
              <ChatBox room={room} name={name} />
            </div>

            <div className="text-center mt-10">
              <p className="text-md font-semibold mb-3 text-gray-300">🔗 Share this Room</p>
              <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
                <span className="text-sm font-mono break-all text-gray-400">
                  {`${window.location.origin}/?room=${room}`}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?room=${room}`)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  📋 Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
