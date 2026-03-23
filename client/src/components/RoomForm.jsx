import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function RoomForm({ onJoin, error }) {
  const params = new URLSearchParams(window.location.search);
  const roomFromUrl = params.get("room") || "";

  const [room, setRoom] = useState(roomFromUrl);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [maxUsers, setMaxUsers] = useState("");

  const generateRoom = () => setRoom(uuidv4().slice(0, 6));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!room || !name) return;
    onJoin(room, name, password, maxUsers ? parseInt(maxUsers) : null);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      background: "radial-gradient(ellipse at 20% 50%, #1a0533 0%, #0d0d1a 40%, #0a1628 100%)"
    }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "56px", height: "56px",
            background: "rgba(124,58,237,0.2)",
            border: "1px solid rgba(124,58,237,0.4)",
            borderRadius: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem"
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 18V5l12-2v13" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="#ffffff" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="#ffffff" strokeWidth="2"/>
            </svg>
          </div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px" }}>Muse</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", marginTop: "4px" }}>Listen together, in sync</div>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "2rem"
        }}>

          {/* Room ID */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#ffffff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              Room ID
            </label>
            <div style={{ display: "flex" }}>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room code"
                style={{
                  flex: 1, padding: "13px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px 0 0 12px",
                  color: "#ffffff", fontSize: "14px", outline: "none"
                }}
              />
              <button
                type="button"
                onClick={generateRoom}
                style={{
                  padding: "13px 16px",
                  background: "rgba(124,58,237,0.3)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  borderLeft: "none",
                  borderRadius: "0 12px 12px 0",
                  color: "#ffffff",
                  fontSize: "15px", cursor: "pointer"
                }}
              >
                🎲
              </button>
            </div>
          </div>

          {/* Your Name */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#ffffff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Who's listening?"
              style={{
                width: "100%", padding: "13px 16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#ffffff", fontSize: "14px", outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "1.25rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px" }}>OPTIONAL</div>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Password + Max Users */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#ffffff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank"
                style={{
                  width: "100%", padding: "13px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#ffffff", fontSize: "14px", outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#ffffff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                Max Users
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                placeholder="No limit"
                style={{
                  width: "100%", padding: "13px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#ffffff", fontSize: "14px", outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center", marginTop: "1rem" }}>{error}</p>
          )}

          {/* Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "1.5rem" }}>
            <button
              type="button"
              onClick={() => {
                if (!room || !name) return;
                onJoin(room, name, password, maxUsers ? parseInt(maxUsers) : null);
              }}
              style={{
                padding: "14px",
                background: "transparent",
                border: "2px solid rgba(255,255,255,0.5)",
                borderRadius: "12px",
                color: "#ffffff",
                WebkitTextFillColor: "#ffffff",
                fontSize: "14px", fontWeight: 600, cursor: "pointer"
              }}
            >
              Create Room
            </button>
            <button
              type="submit"
              style={{
                padding: "14px",
                background: "#7c3aed",
                border: "2px solid #7c3aed",
                borderRadius: "12px",
                color: "#ffffff",
                WebkitTextFillColor: "#ffffff",
                fontSize: "14px", fontWeight: 600, cursor: "pointer"
              }}
            >
              Join Room →
            </button>
          </div>
        </form>

        <p style={{ textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.2)", marginTop: "1.25rem" }}>
          Rooms are cleared when everyone leaves
        </p>
      </div>
    </div>
  );
}
