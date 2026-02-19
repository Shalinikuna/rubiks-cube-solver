import React, { useState, useRef, useEffect } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [currentFace, setCurrentFace] = useState(1);
  const [faces, setFaces] = useState([]);
  const [solution, setSolution] = useState([]);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [stream, setStream] = useState(null);

  // ================= START CAMERA =================
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      setStream(mediaStream);
      setCameraStarted(true);
    } catch (error) {
      alert("Camera access failed: " + error.message);
    }
  };

  // Attach stream AFTER video element exists
  useEffect(() => {
    if (cameraStarted && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStarted, stream]);

  // ================= CAPTURE FACE =================
  const captureFace = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert("Video not ready yet");
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

    setFaces([...faces, detectedColors]);
    setCurrentFace((prev) => prev + 1);
  };

  // ================= DETECT COLORS =================
  const detectGridColors = (ctx, width, height) => {
    const squareWidth = width / 3;
    const squareHeight = height / 3;

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

  // ================= SMART COLOR MATCH =================
  const mapColor = (r, g, b) => {
    const colors = {
      U: [255, 255, 255],
      R: [200, 0, 0],
      F: [0, 200, 0],
      B: [0, 0, 200],
      D: [255, 255, 0],
      L: [255, 120, 0],
    };

    let minDistance = Infinity;
    let closestColor = "U";

    for (let key in colors) {
      const [cr, cg, cb] = colors[key];

      const distance =
        (r - cr) ** 2 +
        (g - cg) ** 2 +
        (b - cb) ** 2;

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = key;
      }
    }

    return closestColor;
  };

  // ================= VALIDATE =================
  const validateCube = (cubeString) => {
    const count = {};
    for (let c of cubeString) {
      count[c] = (count[c] || 0) + 1;
    }

    return (
      count.U === 9 &&
      count.R === 9 &&
      count.F === 9 &&
      count.D === 9 &&
      count.L === 9 &&
      count.B === 9
    );
  };

  // ================= WORD MOVES =================
  const convertMoveToWords = (move) => {
    const map = {
      R: "Rotate Right clockwise",
      "R'": "Rotate Right counter-clockwise",
      R2: "Rotate Right twice",
      L: "Rotate Left clockwise",
      "L'": "Rotate Left counter-clockwise",
      L2: "Rotate Left twice",
      U: "Rotate Top clockwise",
      "U'": "Rotate Top counter-clockwise",
      U2: "Rotate Top twice",
      D: "Rotate Bottom clockwise",
      "D'": "Rotate Bottom counter-clockwise",
      D2: "Rotate Bottom twice",
      F: "Rotate Front clockwise",
      "F'": "Rotate Front counter-clockwise",
      F2: "Rotate Front twice",
      B: "Rotate Back clockwise",
      "B'": "Rotate Back counter-clockwise",
      B2: "Rotate Back twice",
    };

    return map[move] || move;
  };

  // ================= SOLVE =================
  const solveCube = async () => {
    const cubeString = faces.join("");

    if (!validateCube(cubeString)) {
      alert("Invalid cube configuration. Scan carefully.");
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
        setSolution(
          data.solution_steps.map(convertMoveToWords)
        );
      } else {
        alert("Solver rejected cube");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  // ================= UI =================
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
            muted
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
          <h2>Step-by-Step Solution</h2>
          {solution.map((step, i) => (
            <div key={i}>
              Step {i + 1}: {step}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
