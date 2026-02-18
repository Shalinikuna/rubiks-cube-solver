import React, { useState } from "react";
import "./App.css";

const API_BASE = "https://rubiks-cube-solver-why2.onrender.com";

function App() {
  const [cubeInput, setCubeInput] = useState("");
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const solveCube = async () => {
    if (!cubeInput) {
      alert("Please enter cube data!");
      return;
    }

    setLoading(true);
    setError("");
    setSolution("");

    try {
      const response = await fetch(
        `${API_BASE}/solve?cube=${encodeURIComponent(cubeInput)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setSolution(data.solution);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="App">
      <h1>🧩 Rubik's Cube Solver</h1>

      <input
        type="text"
        placeholder="Enter cube string..."
        value={cubeInput}
        onChange={(e) => setCubeInput(e.target.value)}
      />

      <br /><br />

      <button onClick={solveCube}>
        Solve Cube
      </button>

      <br /><br />

      {loading && <p>⏳ Solving...</p>}

      {solution && (
        <div>
          <h3>✅ Solution:</h3>
          <p>{solution}</p>
        </div>
      )}

      {error && (
        <div>
          <h3>❌ Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;
