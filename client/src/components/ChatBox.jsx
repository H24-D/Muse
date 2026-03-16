import React, { useState, useEffect } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import socket from '../socket';

function ChatBox({ room, name }) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [showPicker, setShowPicker] = useState(false);

  const addEmoji = (emoji) => {
    setMsg((prev) => prev + emoji.native);
    setShowPicker(false);
  };

  const sendMsg = () => {
    if (msg.trim() === '') return;
    socket.emit('chat', { room, name, msg });
    setMsg('');
  };

  useEffect(() => {
    const handleChat = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('chat', handleChat);
    return () => socket.off('chat', handleChat);
  }, []);

  return (
    <div className="p-5 bg-white text-gray-800 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
      <div className="text-lg font-semibold mb-3 text-indigo-600">💬 Chat</div>

      <div className="bg-gray-100 overflow-y-auto h-40 p-3 mb-3 rounded-md border border-gray-300">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">
            <strong className="text-indigo-500">{m.name}:</strong>{' '}
            <span>{m.msg}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Type a message..."
          className="border border-gray-300 rounded-md px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <button
          onClick={() => setShowPicker((prev) => !prev)}
          className="text-xl hover:scale-110 transition-transform"
        >
          😊
        </button>

        <button
          onClick={sendMsg}
          className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition"
        >
          Send
        </button>
      </div>

      {showPicker && (
        <div className="mt-3">
          <Picker data={data} onEmojiSelect={addEmoji} />
        </div>
      )}
    </div>
  );
}

export default ChatBox;
