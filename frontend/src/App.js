import React, { useState, useRef } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [currentFace, setCurrentFace] = useState(1);
  const [faces, setFaces] = useState([]);
  const [solution, setSolution] = useState([]);
  const [cameraStarted, setCameraStarted] = useState(false);

  // ================= CAMERA =================

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStarted(true);
      }
    } catch (error) {
      alert("Camera access failed: " + error.message);
    }
  };

  // ================= CAPTURE =================

  const captureFace = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const detectedColors = detectGridColors(
      ctx,
      canvas.width,
      canvas.height
    );

    setFaces([...faces, detectedColors]);
    setCurrentFace(currentFace + 1);
  };

  // ================= COLOR DETECTION =================

  const detectGridColors = (ctx, width, height) => {
    const squareWidth = width / 3;
    const squareHeight = height / 3;

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
    // White
    if (r > 200 && g > 200 && b > 200) return "U";

    // Red
    if (r > 150 && g < 120 && b < 120) return "R";

    // Orange
    if (r > 180 && g > 100 && g < 180 && b < 100) return "L";

    // Yellow
    if (r > 200 && g > 200 && b < 150) return "D";

    // Green
    if (g > 150 && r < 150 && b < 150) return "F";

    // Blue
    if (b > 150 && r < 150 && g < 150) return "B";

    return "U";
  };

  // ================= VALIDATION =================

  const validateCube = (cubeString) => {
    const count = {};

    for (let c of cubeString) {
      count[c] = (count[c] || 0) + 1;
    }

    console.log("Cube String:", cubeString);
    console.log("Color Count:", count);

    return (
      count["U"] === 9 &&
      count["R"] === 9 &&
      count["F"] === 9 &&
      count["D"] === 9 &&
      count["L"] === 9 &&
      count["B"] === 9
    );
  };

  // ================= MOVE CONVERTER =================

  const convertMoveToWords = (move) => {
    const moveMap = {
      R: "Rotate Right face clockwise",
      "R'": "Rotate Right face counter-clockwise",
      R2: "Rotate Right face twice",

      L: "Rotate Left face clockwise",
      "L'": "Rotate Left face counter-clockwise",
      L2: "Rotate Left face twice",

      U: "Rotate Top face clockwise",
      "U'": "Rotate Top face counter-clockwise",
      U2: "Rotate Top face twice",

      D: "Rotate Bottom face clockwise",
      "D'": "Rotate Bottom face counter-clockwise",
      D2: "Rotate Bottom face twice",

      F: "Rotate Front face clockwise",
      "F'": "Rotate Front face counter-clockwise",
      F2: "Rotate Front face twice",

      B: "Rotate Back face clockwise",
      "B'": "Rotate Back face counter-clockwise",
      B2: "Rotate Back face twice"
    };

    return moveMap[move] || move;
  };

  // ================= SOLVE =================

  const solveCube = async () => {
    const cubeString = faces.join("");

    if (!validateCube(cubeString)) {
      alert("Invalid cube configuration");
      return;
    }

    try {
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
        const readableSteps = data.solution_steps.map((move) =>
          convertMoveToWords(move)
        );
        setSolution(readableSteps);
      } else {
        alert("Invalid cube configuration");
      }
    } catch (error) {
      alert("Server error: " + error.message);
    }
  };

  // ================= UI =================

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
