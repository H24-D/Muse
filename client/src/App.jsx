import { useState, useEffect, useCallback } from "react";
import RoomForm from "./components/RoomForm";
import AudioPlayer from "./components/AudioPlayer";
import ChatBox from "./components/ChatBox";
import ServerWakeup from "./components/ServerWakeup";
import socket from "./socket";

function Toast({ message, type }) {
  return (
    <div style={{
      position: "fixed", top: "16px", right: "16px", zIndex: 50,
      padding: "12px 16px", borderRadius: "10px",
      fontSize: "13px", fontWeight: 600, color: "#fff",
      background: type === "join" ? "#065f46" : type === "leave" ? "#7f1d1d" : "#92400e",
      border: `1px solid ${type === "join" ? "#059669" : type === "leave" ? "#991b1b" : "#b45309"}`
    }}>
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const handleServerReady = useCallback(() => setServerReady(true), []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    socket.on("room-users", (users) => {
      setRoomUsers(users);
      setJoined(true);
    });
    socket.on("user-joined", (userName) => showToast(`${userName} joined 🎉`, "join"));
    socket.on("user-left", (userName) => showToast(`${userName} left 👋`, "leave"));
    socket.on("join-error", (msg) => {
      setJoinError(msg);
      setJoined(false);
    });
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
    const emit = () => socket.emit("join", roomId, userName, password, maxUsers);
    socket.connected ? emit() : socket.once("connect", emit);
  };

  const handleLeave = () => {
    socket.emit("leave-room", room);
    setJoined(false);
    setRoom("");
    setName("");
    setRoomUsers([]);
    setJoinError("");
  };

  if (!serverReady) return <ServerWakeup onReady={handleServerReady} />;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", fontFamily: "sans-serif" }}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      {!joined ? (
        <RoomForm onJoin={handleJoin} error={joinError} />
      ) : (
        <div style={{
          maxWidth: isMobile ? "680px" : "1100px",
          margin: "0 auto",
          paddingBottom: "32px"
        }}>

          {/* Topbar */}
          <div style={{
            background: "#0d0d1a", padding: "14px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "sticky", top: 0, zIndex: 10
          }}>
            <div style={{ fontSize: isMobile ? "20px" : "28px", fontWeight: 700, color: "#fff" }}>
              🎶 <span style={{ color: "#a78bfa" }}>Muse</span>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <div style={{
                background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)",
                borderRadius: "8px", padding: "4px 10px",
                fontSize: "12px", color: "#c4b5fd", fontFamily: "monospace"
              }}>
                {isMobile ? room : `Room ID: ${room}`}
              </div>
              <button onClick={handleLeave} style={{
                background: "#7f1d1d", border: "1px solid #991b1b",
                borderRadius: "8px", padding: "6px 12px",
                color: "#fca5a5", fontSize: "12px", fontWeight: 600, cursor: "pointer"
              }}>🚪 Leave</button>
            </div>
          </div>

          {/* Listeners */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 16px", flexWrap: "wrap",
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.05)"
          }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>🎧 Listening:</span>
            {roomUsers.map((u, i) => (
              <span key={i} style={{
                background: "#4c1d95", border: "1px solid #6d28d9",
                borderRadius: "20px", padding: "3px 10px",
                fontSize: "12px", color: "#c4b5fd"
              }}>{u}</span>
            ))}
          </div>

          {/* Audio + Chat — 1 col on mobile, 2 col on desktop */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "12px",
            margin: "12px"
          }}>
            <AudioPlayer room={room} name={name} />
            <ChatBox room={room} name={name} />
          </div>

          {/* Share */}
          <div style={{
            margin: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "14px"
          }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#a78bfa", marginBottom: "8px" }}>
              🔗 Share Room
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "10px", padding: "10px 12px"
            }}>
              <span style={{
                flex: 1, fontSize: "12px", color: "rgba(255,255,255,0.3)",
                fontFamily: "monospace", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap"
              }}>{`${window.location.origin}/?room=${room}`}</span>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?room=${room}`)}
                style={{
                  padding: "6px 12px", background: "#4c1d95", border: "1px solid #6d28d9",
                  borderRadius: "8px", color: "#c4b5fd", fontSize: "12px",
                  fontWeight: 600, cursor: "pointer", flexShrink: 0
                }}
              >📋 Copy</button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;
