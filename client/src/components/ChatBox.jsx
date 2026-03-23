import React, { useState, useEffect, useRef } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import socket from '../socket';

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px", padding: "14px"
};

function ChatBox({ room, name }) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const addEmoji = (emoji) => {
    setMsg((prev) => prev + emoji.native);
    setShowPicker(false);
  };

  const sendMsg = () => {
    if (msg.trim() === '') return;
    socket.emit('chat', { room, name, msg });
    setMsg('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMsg();
  };

  useEffect(() => {
    const handleChat = (data) => setMessages((prev) => [...prev, data]);
    socket.on('chat', handleChat);
    return () => socket.off('chat', handleChat);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#a78bfa", marginBottom: "12px" }}>💬 Chat</div>

      {/* Messages */}
      <div style={{
        background: "rgba(255,255,255,0.03)", borderRadius: "10px",
        padding: "10px", height: "140px", overflowY: "auto", marginBottom: "10px"
      }}>
        {messages.length === 0 && (
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: "20px" }}>
            No messages yet...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ fontSize: "13px", marginBottom: "6px", color: "rgba(255,255,255,0.8)" }}>
            <strong style={{ color: "#a78bfa" }}>{m.name}:</strong> {m.msg}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{
            flex: 1, minWidth: 0,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", padding: "10px 12px",
            color: "#fff", fontSize: "13px", outline: "none"
          }}
        />
        <button
          onClick={() => setShowPicker((prev) => !prev)}
          style={{
            width: "36px", height: "36px", flexShrink: 0,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", fontSize: "16px", cursor: "pointer"
          }}
        >😊</button>
        <button
          onClick={sendMsg}
          style={{
            padding: "10px 14px", flexShrink: 0,
            background: "#7c3aed", border: "1px solid #7c3aed",
            borderRadius: "10px", color: "#fff",
            fontSize: "13px", fontWeight: 600, cursor: "pointer"
          }}
        >Send</button>
      </div>

      {showPicker && (
        <div style={{ marginTop: "10px" }}>
          <Picker data={data} onEmojiSelect={addEmoji} theme="dark" />
        </div>
      )}
    </div>
  );
}

export default ChatBox;
