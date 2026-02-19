import React, { useState, useRef } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [currentFace, setCurrentFace] = useState(1);
  const [faces, setFaces] = useState([]);
  const [solution, setSolution] = useState([]);
  const [cameraStarted, setCameraStarted] = useState(false);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setCameraStarted(true);
  };

  const captureFace = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const detectedColors = detectGridColors(ctx, canvas.width, canvas.height);

    setFaces([...faces, detectedColors]);
    setCurrentFace(currentFace + 1);
  };

  const detectGridColors = (ctx, width, height) => {
    const gridSize = 3;
    const squareWidth = width / gridSize;
    const squareHeight = height / gridSize;

    let cubeFace = "";

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {

        const x = col * squareWidth + squareWidth / 2;
        const y = row * squareHeight + squareHeight / 2;

        const pixel = ctx.getImageData(x, y, 1, 1).data;

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        cubeFace += mapColor(r, g, b);
      }
    }

    return cubeFace;
  };

  const mapColor = (r, g, b) => {

    if (r > 200 && g > 200 && b > 200) return "W";
    if (r > 200 && g < 100 && b < 100) return "R";
    if (r < 100 && g > 200 && b < 100) return "G";
    if (r < 100 && g < 100 && b > 200) return "B";
    if (r > 200 && g > 150 && b < 100) return "Y";
    if (r > 200 && g > 100 && b < 50) return "O";

    return "W"; // fallback
  };

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
      setSolution(data.solution_steps);
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
            width="400"
            height="300"
            style={{ border: "2px solid black" }}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <br />
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
