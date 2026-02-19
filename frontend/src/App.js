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
        video: { facingMode: "environment" }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraStarted(true);
    } catch (err) {
      alert("Camera access failed: " + err.message);
    }
  };

  // ================= CAPTURE =================
  const captureFace = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) {
      alert("Camera not ready");
      return;
    }

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const detectedColors = detectGridColors(ctx, canvas.width, canvas.height);

    setFaces(prev => [...prev, detectedColors]);
    setCurrentFace(prev => prev + 1);
  };

  // ================= DETECT COLORS =================
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

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        cubeFace += mapColor(r, g, b);
      }
    }

    return cubeFace;
  };

  // ================= COLOR MAPPING (FOR KOCIEMBA) =================
  const mapColor = (r, g, b) => {

    // WHITE -> U
    if (r > 200 && g > 200 && b > 200) return "U";

    // RED -> R
    if (r > 180 && g < 100 && b < 100) return "R";

    // GREEN -> F
    if (r < 100 && g > 150 && b < 100) return "F";

    // BLUE -> B
    if (r < 100 && g < 100 && b > 150) return "B";

    // YELLOW -> D
    if (r > 200 && g > 200 && b < 100) return "D";

    // ORANGE -> L
    if (r > 200 && g > 120 && b < 80) return "L";

    return "U"; // fallback
  };

  // ================= TRANSLATE MOVES TO WORDS =================
  const translateMove = (move) => {
    const map = {
      U: "Rotate Top Clockwise",
      "U'": "Rotate Top Counter-Clockwise",
      U2: "Rotate Top Twice",

      R: "Rotate Right Clockwise",
      "R'": "Rotate Right Counter-Clockwise",
      R2: "Rotate Right Twice",

      L: "Rotate Left Clockwise",
      "L'": "Rotate Left Counter-Clockwise",
      L2: "Rotate Left Twice",

      F: "Rotate Front Clockwise",
      "F'": "Rotate Front Counter-Clockwise",
      F2: "Rotate Front Twice",

      B: "Rotate Back Clockwise",
      "B'": "Rotate Back Counter-Clockwise",
      B2: "Rotate Back Twice",

      D: "Rotate Bottom Clockwise",
      "D'": "Rotate Bottom Counter-Clockwise",
      D2: "Rotate Bottom Twice"
    };

    return map[move] || move;
  };

  // ================= SOLVE =================
  const solveCube = async () => {
    const cubeString = faces.join("");

    if (cubeString.length !== 54) {
      alert("Scan all 6 faces first.");
      return;
    }

    // Validate 9 of each color
    const count = {};
    for (let c of cubeString) {
      count[c] = (count[c] || 0) + 1;
    }

    for (let key of ["U", "R", "F", "D", "L", "B"]) {
      if (count[key] !== 9) {
        alert("Invalid cube colors detected. Please rescan carefully.");
        return;
      }
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
        const translated = data.solution_steps.map(step =>
          translateMove(step)
        );
        setSolution(translated);
      } else {
        alert("Invalid cube configuration");
      }

    } catch (err) {
      alert("Error solving cube");
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
            playsInline
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
