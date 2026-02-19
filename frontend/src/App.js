import React, { useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);

  const [faces, setFaces] = useState([]);
  const [steps, setSteps] = useState([]);

  const backendURL = "https://rubiks-cube-solver-why2.onrender.com";

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const captureFace = async () => {
    const res = await fetch(`${backendURL}/scan-face`, {
      method: "POST"
    });

    const data = await res.json();

    setFaces(prev => [...prev, data]);
  };

  const solveCube = async () => {
    const res = await fetch(`${backendURL}/solve`);
    const data = await res.json();
    setSteps(data.steps);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Rubik's Cube Scanner & Solver</h1>

      <video ref={videoRef} width="400" autoPlay />

      <br /><br />

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureFace}>Capture Face</button>

      <h2>Scanned Faces:</h2>

      {faces.map((face, index) => (
        <div key={index}>
          <h3>Face {face.face_number}</h3>
          <p>{face.face_colors.join(", ")}</p>
        </div>
      ))}

      <br />

      <button onClick={solveCube}>Solve Cube</button>

      <h2>Step-by-Step Solution:</h2>

      {steps.map((step, index) => (
        <p key={index}>
          Step {index + 1}: {step}
        </p>
      ))}
    </div>
  );
}

export default App;
