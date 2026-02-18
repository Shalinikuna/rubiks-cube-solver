import React, { useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [colors, setColors] = useState([]);
  const [solution, setSolution] = useState("");

  // 🎥 Start Camera
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // 📷 Capture Image & Send to Backend
  const captureAndScan = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/png");

    const response = await fetch(
      "https://rubiks-cube-solver-why2.onrender.com/scan-face",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      }
    );

    const data = await response.json();
    setColors(data.colors || []);
  };

  // 🧠 Solve Cube
  const solveCube = async () => {
    const response = await fetch(
      "https://rubiks-cube-solver-why2.onrender.com/solve"
    );

    const data = await response.json();
    setSolution(data.solution);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1>🧩 Rubik's Cube Scanner & Solver</h1>

      <video ref={videoRef} autoPlay width="300" />
      <br /><br />

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureAndScan}>Capture & Scan</button>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <h3>Detected Colors:</h3>
      <p>{colors.join(", ")}</p>

      <button onClick={solveCube}>Solve Cube</button>

      <h3>Solution:</h3>
      <p>{solution}</p>
    </div>
  );
}

export default App;
