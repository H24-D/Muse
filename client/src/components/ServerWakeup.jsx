import { useEffect, useState } from "react";
import socket from "../socket";

const MESSAGES = [
  "Waking up the server…",
  "Render free tier takes ~30s on first load…",
  "Almost there, hang tight…",
  "Connecting to Muse backend…",
  "Still warming up, nearly ready…",
];

export default function ServerWakeup({ onReady }) {
  const [status, setStatus] = useState("connecting"); // connecting | connected | failed
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState("");
  const [elapsed, setElapsed] = useState(0);

  // Cycle through reassuring messages
  useEffect(() => {
    if (status !== "connecting") return;
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(id);
  }, [status]);

  // Animate dots
  useEffect(() => {
    if (status !== "connecting") return;
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(id);
  }, [status]);

  // Count elapsed seconds
  useEffect(() => {
    if (status !== "connecting") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  // Listen for socket events
  useEffect(() => {
    const handleConnect = () => {
      setStatus("connected");
      setTimeout(() => onReady(), 800); // brief pause to show success
    };
    const handleError = () => setStatus("failed");

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleError);

    // If already connected (e.g. localhost)
    if (socket.connected) {
      setStatus("connected");
      setTimeout(() => onReady(), 400);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleError);
    };
  }, [onReady]);

  if (status === "connected") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Success pulse ring */}
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-20 w-20 rounded-full bg-green-400 opacity-30 animate-ping" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/40">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          </div>
          <p className="text-green-400 font-semibold text-lg tracking-wide">Connected!</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-5 text-center px-8 max-w-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40">
            <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-1">Connection failed</p>
            <p className="text-gray-400 text-sm">The server couldn't be reached. Check your connection or try again.</p>
          </div>
          <button
            onClick={() => {
              setStatus("connecting");
              setElapsed(0);
              socket.connect();
            }}
            className="mt-2 px-6 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Connecting state ---
  const progress = Math.min((elapsed / 45) * 100, 95); // cap at 95% until actually connected

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      {/* Subtle animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl animate-blob" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative flex flex-col items-center gap-7 text-center px-8 max-w-sm w-full">
        {/* Logo / icon */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🎵</span>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Muse
          </h1>
        </div>

        {/* Spinner ring */}
        <div className="relative flex items-center justify-center">
          <svg
            className="w-16 h-16 -rotate-90"
            viewBox="0 0 64 64"
          >
            {/* Track */}
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="rgba(99,102,241,0.15)"
              strokeWidth="4"
            />
            {/* Progress arc */}
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          {/* Elapsed seconds */}
          <span className="absolute text-indigo-300 text-sm font-mono font-semibold">
            {elapsed}s
          </span>
        </div>

        {/* Status message */}
        <div className="min-h-[48px] flex flex-col items-center gap-1">
          <p className="text-white font-medium text-base transition-all duration-500">
            {MESSAGES[msgIndex]}{dots}
          </p>
          {elapsed > 8 && (
            <p className="text-gray-500 text-xs mt-1 animate-fade-in">
              Render free tier sleeps after inactivity — first load takes ~30s
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{
              width: `${progress}%`,
              transition: "width 1s ease",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.97); }
        }
        .animate-blob { animation: blob 8s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease forwards; }
      `}</style>
    </div>
  );
}
