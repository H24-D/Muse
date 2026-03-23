import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import socket from "../socket";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px", padding: "14px"
};

export default function AudioPlayer({ room, name }) {
  const waveformRef = useRef();
  const wavesurfer = useRef();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#6d28d9",
      progressColor: "#a78bfa",
      height: 60,
      responsive: true,
    });

    wavesurfer.current.on("audioprocess", () => setCurrentTime(wavesurfer.current.getCurrentTime()));
    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current.getDuration());
      setCurrentTime(0);
    });

    socket.off("play");
    socket.off("pause");
    socket.off("seek");
    socket.off("audio-loaded");
    socket.off("room-state");

    socket.on("play", () => wavesurfer.current?.play());
    socket.on("pause", () => wavesurfer.current?.pause());
    socket.on("seek", (progress) => wavesurfer.current?.seekTo(progress));
    socket.on("audio-loaded", ({ url, filename }) => {
      wavesurfer.current.load(url);
      setFile(filename);
    });
    socket.on("room-state", ({ url, filename, playing, progress }) => {
      wavesurfer.current.load(url);
      setFile(filename);
      wavesurfer.current.once("ready", () => {
        if (progress) wavesurfer.current.seekTo(progress);
        if (playing) wavesurfer.current.play();
      });
    });

    return () => {
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
      socket.off("audio-loaded");
      socket.off("room-state");
      wavesurfer.current?.destroy();
    };
  }, []);

  const loadAudio = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("audio", selectedFile);
    try {
      const res = await fetch(`${BACKEND_URL}/upload`, { method: "POST", body: formData });
      const data = await res.json();
      wavesurfer.current.load(data.url);
      setFile(selectedFile.name);
      socket.emit("audio-loaded", { room, url: data.url, filename: selectedFile.name });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePlay = () => { wavesurfer.current?.play(); socket.emit("play", room); };
  const handlePause = () => { wavesurfer.current?.pause(); socket.emit("pause", room); };
  const handleSeek = () => {
    const progress = wavesurfer.current.getCurrentTime() / wavesurfer.current.getDuration();
    socket.emit("seek", { room, progress });
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#a78bfa", marginBottom: "12px" }}>🎧 Audio Player</div>

      {/* Upload */}
      <label style={{
        display: "block", width: "100%", padding: "10px",
        background: "rgba(124,58,237,0.2)", border: "1px dashed rgba(124,58,237,0.5)",
        borderRadius: "10px", color: "#c4b5fd", fontSize: "13px",
        textAlign: "center", cursor: "pointer", marginBottom: "10px",
        boxSizing: "border-box"
      }}>
        {uploading ? "⏫ Uploading..." : file ? `🎵 ${file}` : "+ Choose Audio File"}
        <input type="file" accept="audio/*" onChange={loadAudio} disabled={uploading} style={{ display: "none" }} />
      </label>

      {/* Waveform */}
      <div
        ref={waveformRef}
        onClick={handleSeek}
        style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", cursor: "pointer", marginBottom: "8px" }}
      />

      {/* Progress bar */}
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "4px", height: "3px", marginBottom: "4px" }}>
        <div style={{ background: "#a78bfa", borderRadius: "4px", height: "3px", width: `${progress}%`, transition: "width 0.3s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", marginBottom: "12px" }}>
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button onClick={handlePlay} disabled={!file} style={{
          padding: "10px", background: "#065f46", border: "1px solid #059669",
          borderRadius: "10px", color: "#6ee7b7", fontSize: "13px",
          fontWeight: 600, cursor: "pointer", opacity: file ? 1 : 0.4
        }}>▶ Play</button>
        <button onClick={handlePause} disabled={!file} style={{
          padding: "10px", background: "#7f1d1d", border: "1px solid #991b1b",
          borderRadius: "10px", color: "#fca5a5", fontSize: "13px",
          fontWeight: 600, cursor: "pointer", opacity: file ? 1 : 0.4
        }}>⏸ Pause</button>
      </div>
    </div>
  );
}
