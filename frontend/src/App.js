import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);

  const [currentFace, setCurrentFace] = useState([]);
  const [allFaces, setAllFaces] = useState([]);
  const [solution, setSolution] = useState("");

  // 🔥 IMPORTANT: Your LIVE backend URL
  const BASE_URL = "https://rubiks-cube-solver-why2.onrender.com";

  const captureFace = async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    try {
      const response = await fetch(`${BASE_URL}/scan-face`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageSrc }),
      });

      const data = await response.json();
      setCurrentFace(data.colors);
    } catch (error) {
      console.error("Error capturing face:", error);
    }
  };

  const saveFace = () => {
    if (currentFace.length === 9) {
      setAllFaces([...allFaces, currentFace]);
      setCurrentFace([]);
    }
  };

  const solveCube = async () => {
    const cubeString = allFaces.flat().join("");

    try {
      const response = await fetch(
        `${BASE_URL}/solve?cube=${cubeString}`
      );

      const data = await response.json();
      setSolution(data.solution);
    } catch (error) {
      console.error("Error solving cube:", error);
    }
  };

  const colorMap = {
    White: "white",
    Yellow: "yellow",
    Red: "red",
    Orange: "orange",
    Blue: "blue",
    Green: "green",
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Rubik's Cube Live Scanner</h1>

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
      />

      <br /><br />

      <button onClick={captureFace}>Capture Face</button>

      <button
        onClick={saveFace}
        style={{ marginLeft: "10px" }}
      >
        Save Face
      </button>

      <h2>Current Face:</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 60px)",
          justifyContent: "center",
          gap: "5px",
        }}
      >
        {currentFace.map((color, index) => (
          <div
            key={`current-${index}`}
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: colorMap[color] || "gray",
              border: "1px solid black",
            }}
          />
        ))}
      </div>

      <h2>Faces Saved: {allFaces.length} / 6</h2>

      <button
        onClick={solveCube}
        disabled={allFaces.length !== 6}
      >
        Solve Cube
      </button>

      <h2>Solution:</h2>
      <h3>{solution}</h3>
    </div>
  );
}

export default App;
