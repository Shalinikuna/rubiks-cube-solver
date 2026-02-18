import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef(null);

  const [currentFace, setCurrentFace] = useState([]);
  const [allFaces, setAllFaces] = useState([]);
  const [cubeState, setCubeState] = useState([]);
  const [solutionMoves, setSolutionMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const colorMap = {
    White: "white",
    Yellow: "yellow",
    Red: "red",
    Orange: "orange",
    Blue: "blue",
    Green: "green",
  };

  const captureFace = async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    const response = await fetch("http://127.0.0.1:8000/scan-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: imageSrc }),
    });

    const data = await response.json();
    setCurrentFace(data.colors);
  };

  const saveFace = () => {
    if (currentFace.length === 9) {
      setAllFaces([...allFaces, currentFace]);
      setCurrentFace([]);
    }
  };

  const solveCube = async () => {
    const cubeString = allFaces.flat().join("");

    const response = await fetch(
      `http://127.0.0.1:8000/solve?cube=${cubeString}`
    );

    const data = await response.json();

    const moves = data.solution.split(" ");
    setSolutionMoves(moves);
    setCubeState(allFaces.flat());
    setCurrentMoveIndex(0);

    animateSolution(moves);
  };

  const animateSolution = (moves) => {
    let index = 0;

    const interval = setInterval(() => {
      if (index >= moves.length) {
        clearInterval(interval);
        return;
      }

      applyMove(moves[index]);
      index++;
      setCurrentMoveIndex(index);
    }, 1000);
  };

  // SIMPLIFIED move simulation (for demo)
  const applyMove = (move) => {
    // This is simplified for demo — real rotation logic is complex
    setCubeState((prev) => [...prev]);
  };

  const renderCube = () => {
    if (cubeState.length !== 54) return null;

    const faces = [];
    for (let i = 0; i < 6; i++) {
      faces.push(cubeState.slice(i * 9, i * 9 + 9));
    }

    return faces.map((face, faceIndex) => (
      <div key={faceIndex} style={{ marginBottom: "20px" }}>
        <h3>Face {faceIndex + 1}</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 50px)",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          {face.map((color, index) => (
            <div
              key={index}
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: colorMap[color] || "gray",
                border: "1px solid black",
              }}
            />
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Rubik's Cube Animated Solver</h1>

      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" width={400} />

      <br /><br />

      <button onClick={captureFace}>Capture Face</button>
      <button onClick={saveFace} style={{ marginLeft: "10px" }}>
        Save Face
      </button>

      <h2>Faces Saved: {allFaces.length} / 6</h2>

      {allFaces.length === 6 && (
        <button onClick={solveCube}>Solve With Animation</button>
      )}

      <h2>Current Move: {solutionMoves[currentMoveIndex - 1]}</h2>

      {renderCube()}
    </div>
  );
}

export default App;
