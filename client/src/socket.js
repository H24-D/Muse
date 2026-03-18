import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  reconnectionDelay: 1000,
  reconnectionAttempts: 10,
});

export default socket;
