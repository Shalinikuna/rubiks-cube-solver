import React, { useState, useRef } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [currentFace, setCurrentFace] = useState(1);
  const [faces, setFaces] = useState([]);
  const [solution, setSolution] = useState([]);
  const [cameraStarted, setCameraStarted] = useState(false);

  // Start Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setCameraStarted(true);
    } catch (error) {
      alert("Camera permission denied or not available");
    }
  };

  // Capture Face
  const captureFace = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const detectedColors = detectGridColors(ctx, canvas.width, canvas.height);

    setFaces(prev => [...prev, detectedColors]);
    setCurrentFace(prev => prev + 1);
  };

  // Detect 3x3 grid colors
  const detectGridColors = (ctx, width, height) => {
    const squareWidth = width / 3;
    const squareHeight = height / 3;
    let cubeFace = "";

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {

        const x = col * squareWidth + squareWidth / 2;
        const y = row * squareHeight + squareHeight / 2;

        const pixel = ctx.getImageData(x, y, 1, 1).data;

        cubeFace += mapColor(pixel[0], pixel[1], pixel[2]);
      }
    }

    return cubeFace;
  };

  // Basic color mapping
  const mapColor = (r, g, b) => {
    if (r > 200 && g > 200 && b > 200) return "W";
    if (r > 200 && g < 100 && b < 100) return "R";
    if (r < 100 && g > 200 && b < 100) return "G";
    if (r < 100 && g < 100 && b > 200) return "B";
    if (r > 200 && g > 150 && b < 100) return "Y";
    if (r > 200 && g > 100 && b < 50) return "O";
    return "W";
  };

  // Convert move notation to words
  const convertMoveToWords = (move) => {
    if (move.includes("R'")) return "Rotate Right Face Anti-Clockwise";
    if (move.includes("R2")) return "Rotate Right Face Twice";
    if (move.includes("R")) return "Rotate Right Face Clockwise";

    if (move.includes("L'")) return "Rotate Left Face Anti-Clockwise";
    if (move.includes("L2")) return "Rotate Left Face Twice";
    if (move.includes("L")) return "Rotate Left Face Clockwise";

    if (move.includes("U'")) return "Rotate Top Face Anti-Clockwise";
    if (move.includes("U2")) return "Rotate Top Face Twice";
    if (move.includes("U")) return "Rotate Top Face Clockwise";

    if (move.includes("D'")) return "Rotate Bottom Face Anti-Clockwise";
    if (move.includes("D2")) return "Rotate Bottom Face Twice";
    if (move.includes("D")) return "Rotate Bottom Face Clockwise";

    if (move.includes("F'")) return "Rotate Front Face Anti-Clockwise";
    if (move.includes("F2")) return "Rotate Front Face Twice";
    if (move.includes("F")) return "Rotate Front Face Clockwise";

    if (move.includes("B'")) return "Rotate Back Face Anti-Clockwise";
    if (move.includes("B2")) return "Rotate Back Face Twice";
    if (move.includes("B")) return "Rotate Back Face Clockwise";

    return move;
  };

  // Solve Cube
  const solveCube = async () => {
    const cubeString = faces.join("");

    const response = await fetch(
      "https://rubiks-cube-solver-why2.onrender.com/solve",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cube_string: cubeString })
      }
    );

    const data = await response.json();

    if (data.solution_steps) {
      const converted = data.solution_steps.map(step =>
        convertMoveToWords(step)
      );
      setSolution(converted);
    } else {
      alert("Invalid cube configuration");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1>🧩 Rubik's Cube Camera Solver</h1>

      {!cameraStarted && (
        <button onClick={startCamera}>Start Camera</button>
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

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <br /><br />

          <button onClick={captureFace}>
            Capture Face {currentFace}
          </button>
        </>
      )}

      {currentFace > 6 && (
        <>
          <h2>All Faces Captured ✅</h2>
          <button onClick={solveCube}>Solve Cube</button>
        </>
      )}

      {solution.length > 0 && (
        <>
          <h2>Step-by-Step Solution</h2>
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
