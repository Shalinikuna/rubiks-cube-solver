import React, { useState, useRef } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [currentFace, setCurrentFace] = useState(1);
  const [faces, setFaces] = useState([]);
  const [solution, setSolution] = useState([]);
  const [cameraStarted, setCameraStarted] = useState(false);

  // ---------------- START CAMERA ----------------
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraStarted(true);
    } catch (err) {
      alert("Camera access failed.");
      console.log(err);
    }
  };

  // ---------------- CAPTURE FACE ----------------
  const captureFace = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || !canvas) {
      alert("Camera not ready.");
      return;
    }

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const detectedColors = detectGridColors(
      ctx,
      canvas.width,
      canvas.height
    );

    console.log("Face detected:", detectedColors);

    setFaces((prev) => [...prev, detectedColors]);
    setCurrentFace((prev) => prev + 1);
  };

  // ---------------- COLOR DETECTION ----------------
  const detectGridColors = (ctx, width, height) => {
    const gridSize = 3;
    const squareWidth = width / gridSize;
    const squareHeight = height / gridSize;

    let cubeFace = "";

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = Math.floor(col * squareWidth + squareWidth / 2);
        const y = Math.floor(row * squareHeight + squareHeight / 2);

        const pixel = ctx.getImageData(x, y, 1, 1).data;

        cubeFace += mapColor(pixel[0], pixel[1], pixel[2]);
      }
    }

    return cubeFace;
  };

  // ---------------- SMART COLOR MATCHING ----------------
  const mapColor = (r, g, b) => {
    const colors = {
      U: [255, 255, 255], // White
      R: [200, 0, 0],     // Red
      F: [0, 200, 0],     // Green
      B: [0, 0, 200],     // Blue
      D: [255, 255, 0],   // Yellow
      L: [255, 120, 0],   // Orange
    };

    let minDistance = Infinity;
    let closest = "U";

    for (let key in colors) {
      const [cr, cg, cb] = colors[key];

      const distance =
        (r - cr) ** 2 +
        (g - cg) ** 2 +
        (b - cb) ** 2;

      if (distance < minDistance) {
        minDistance = distance;
        closest = key;
      }
    }

    return closest;
  };

  // ---------------- MOVE TO WORD CONVERSION ----------------
  const convertMoveToWords = (move) => {
    const mapping = {
      U: "Rotate Top Face Clockwise",
      "U'": "Rotate Top Face Counter-Clockwise",
      R: "Rotate Right Face Clockwise",
      "R'": "Rotate Right Face Counter-Clockwise",
      L: "Rotate Left Face Clockwise",
      "L'": "Rotate Left Face Counter-Clockwise",
      F: "Rotate Front Face Clockwise",
      "F'": "Rotate Front Face Counter-Clockwise",
      B: "Rotate Back Face Clockwise",
      "B'": "Rotate Back Face Counter-Clockwise",
      D: "Rotate Bottom Face Clockwise",
      "D'": "Rotate Bottom Face Counter-Clockwise",
    };

    return mapping[move] || move;
  };

  // ---------------- SOLVE CUBE ----------------
  const solveCube = async () => {
    const cubeString = faces.join("");

    console.log("Final cube string:", cubeString);

    if (cubeString.length !== 54) {
      alert("Cube not fully scanned.");
      return;
    }

    try {
      const response = await fetch(
        "https://rubiks-cube-solver-why2.onrender.com/solve",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cube_string: cubeString }),
        }
      );

      const data = await response.json();

      if (data.solution_steps) {
        const readableSteps =
          data.solution_steps.map(convertMoveToWords);

        setSolution(readableSteps);
      } else {
        alert("Invalid cube configuration. Scan carefully.");
        console.log(data);
      }
    } catch (err) {
      alert("Server error.");
      console.log(err);
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1>🧩 Rubik's Cube Camera Solver</h1>

      {!cameraStarted && (
        <button onClick={startCamera}>
          Start Camera
        </button>
      )}

      {cameraStarted && currentFace <= 6 && (
        <>
          <h2>Scan Face {currentFace} of 6</h2>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            width="400"
            height="300"
            style={{ border: "2px solid black" }}
          />

          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
          />

          <br />
          <button onClick={captureFace}>
            Capture Face {currentFace}
          </button>
        </>
      )}

      {currentFace > 6 && (
        <>
          <h2>All Faces Captured ✅</h2>
          <button onClick={solveCube}>
            Solve Cube
          </button>
        </>
      )}

      {solution.length > 0 && (
        <>
          <h2>Solution Steps</h2>
          {solution.map((step, index) => (
            <div key={index}>
              Step {index + 1}: {step}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
