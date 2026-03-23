import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import socket from "../socket";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export default function AudioPlayer({ room, name }) {
  const waveformRef = useRef();
  const wavesurfer = useRef();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#6366f1",
      progressColor: "#8b5cf6",
      height: 80,
      responsive: true,
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
      console.log("📥 audio-loaded received:", url);
      wavesurfer.current.load(url);
      setFile(filename);
    });

    socket.on("room-state", ({ url, filename, playing, progress }) => {
      console.log("📦 Room state received:", url, "playing:", playing);
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
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      wavesurfer.current.load(data.url);
      setFile(selectedFile.name);

      socket.emit("audio-loaded", {
        room,
        url: data.url,
        filename: selectedFile.name,
      });
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePlay = () => {
    wavesurfer.current?.play();
    socket.emit("play", room);
  };

  const handlePause = () => {
    wavesurfer.current?.pause();
    socket.emit("pause", room);
  };

  const handleSeek = () => {
    const progress =
      wavesurfer.current.getCurrentTime() / wavesurfer.current.getDuration();
    socket.emit("seek", { room, progress });
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 text-white space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-indigo-400">🎧 Audio Player</h2>
        <div className="text-sm bg-gray-700 text-indigo-300 px-3 py-1 rounded font-mono">
          Room: <span className="font-semibold">{room}</span>
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-300">
          Upload Audio File
        </label>
        <input
          type="file"
          accept="audio/*"
          onChange={loadAudio}
          disabled={uploading}
          className="block w-full text-sm text-gray-100 file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-600 file:text-white
            hover:file:bg-indigo-700
            cursor-pointer disabled:opacity-50"
        />
        {uploading && (
          <p className="text-sm mt-2 text-indigo-400 animate-pulse">
            ⏫ Uploading to cloud…
          </p>
        )}
        {file && !uploading && (
          <p className="text-sm mt-2 text-gray-400">
            Now playing: <span className="italic">{file}</span>
          </p>
        )}
      </div>

      <div
        ref={waveformRef}
        className="bg-gray-700 rounded h-24 cursor-pointer"
        onClick={handleSeek}
      />

      <div className="flex space-x-4 justify-center mt-4">
        <button
          onClick={handlePlay}
          className="bg-green-500 hover:bg-green-600 transition px-5 py-2 rounded text-white font-semibold shadow"
        >
          ▶ Play
        </button>
        <button
          onClick={handlePause}
          className="bg-red-500 hover:bg-red-600 transition px-5 py-2 rounded text-white font-semibold shadow"
        >
          ⏸ Pause
        </button>
      </div>
    </div>
  );
}
