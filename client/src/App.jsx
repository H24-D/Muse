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

  const handleServerReady = useCallback(() => setServerReady(true), []);

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
        <>
          {/* ── MOBILE layout (< 1024px) ── */}
          <div className="mobile-layout" style={{ maxWidth: "680px", margin: "0 auto", paddingBottom: "32px" }}>

            <div style={{
              background: "#0d0d1a", padding: "14px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              position: "sticky", top: 0, zIndex: 10
            }}>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>
                🎶 <span style={{ color: "#a78bfa" }}>Muse</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{
                  background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)",
                  borderRadius: "8px", padding: "4px 10px",
                  fontSize: "12px", color: "#c4b5fd", fontFamily: "monospace"
                }}>{room}</div>
                <button onClick={handleLeave} style={{
                  background: "#7f1d1d", border: "1px solid #991b1b",
                  borderRadius: "8px", padding: "6px 12px",
                  color: "#fca5a5", fontSize: "12px", fontWeight: 600, cursor: "pointer"
                }}>🚪 Leave</button>
              </div>
            </div>

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

            <div style={{ margin: "12px" }}><AudioPlayer room={room} name={name} /></div>
            <div style={{ margin: "12px" }}><ChatBox room={room} name={name} /></div>

            <div style={{
              margin: "12px", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "14px"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#a78bfa", marginBottom: "8px" }}>🔗 Share Room</div>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px", padding: "10px 12px"
              }}>
                <span style={{
                  flex: 1, fontSize: "12px", color: "rgba(255,255,255,0.3)",
                  fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
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

          {/* ── DESKTOP layout (>= 1024px) ── */}
          <div className="desktop-layout" style={{
            minHeight: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "48px 24px"
          }}>
            <div style={{
              width: "100%", maxWidth: "1100px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px", padding: "40px", gap: "32px",
              display: "flex", flexDirection: "column"
            }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ fontSize: "32px", fontWeight: 800, color: "#fff" }}>
                  🎶 Welcome to <span style={{ color: "#a78bfa" }}>Muse</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{
                    background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)",
                    borderRadius: "10px", padding: "6px 14px",
                    fontSize: "13px", color: "#c4b5fd", fontFamily: "monospace"
                  }}>Room ID: <strong>{room}</strong></div>
                  <button onClick={handleLeave} style={{
                    background: "#7f1d1d", border: "1px solid #991b1b",
                    borderRadius: "10px", padding: "8px 16px",
                    color: "#fca5a5", fontSize: "13px", fontWeight: 600, cursor: "pointer"
                  }}>🚪 Leave</button>
                </div>
              </div>

              {/* Listeners */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>🎧 Listening:</span>
                {roomUsers.map((u, i) => (
                  <span key={i} style={{
                    background: "#4c1d95", border: "1px solid #6d28d9",
                    borderRadius: "20px", padding: "4px 12px",
                    fontSize: "12px", color: "#c4b5fd"
                  }}>{u}</span>
                ))}
              </div>

              {/* 2-column grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <AudioPlayer room={room} name={name} />
                <ChatBox room={room} name={name} />
              </div>

              {/* Share */}
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: "12px" }}>
                  🔗 Share this Room
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px", padding: "14px 16px"
                }}>
                  <span style={{
                    flex: 1, fontSize: "13px", color: "rgba(255,255,255,0.3)",
                    fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>{`${window.location.origin}/?room=${room}`}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/?room=${room}`)}
                    style={{
                      padding: "8px 16px", background: "#4c1d95", border: "1px solid #6d28d9",
                      borderRadius: "8px", color: "#c4b5fd", fontSize: "13px",
                      fontWeight: 600, cursor: "pointer", flexShrink: 0
                    }}
                  >📋 Copy Link</button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
