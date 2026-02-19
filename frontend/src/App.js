import React, { useState } from "react";

function App() {
  const [faces, setFaces] = useState({
    face1: "",
    face2: "",
    face3: "",
    face4: "",
    face5: "",
    face6: ""
  });

  const [solution, setSolution] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^RGBYOW]/g, "");
    setFaces({
      ...faces,
      [e.target.name]: value
    });
  };

  const validateInput = () => {
    for (let key in faces) {
      if (faces[key].length !== 9) {
        alert("Each face must contain exactly 9 letters (R,G,B,Y,O,W)");
        return false;
      }
    }
    return true;
  };

  const solveCube = async () => {
    if (!validateInput()) return;

    const cubeString =
      faces.face1 +
      faces.face2 +
      faces.face3 +
      faces.face4 +
      faces.face5 +
      faces.face6;

    if (cubeString.length !== 54) {
      alert("Cube must contain exactly 54 characters.");
      return;
    }

    try {
      setLoading(true);
      setSolution([]);

      const response = await fetch(
        "https://rubiks-cube-solver-why2.onrender.com/solve",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cube_string: cubeString })
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      if (data.solution_steps) {
        setSolution(data.solution_steps);
      } else {
        alert("Invalid cube configuration");
      }

    } catch (error) {
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>🧩 Rubik's Cube Face-wise Solver</h1>

      <h3>Enter each face (Use only R G B Y O W)</h3>

      {Object.keys(faces).map((face, index) => (
        <div key={index} style={{ margin: "10px" }}>
          <label>Face {index + 1}: </label>
          <input
            name={face}
            value={faces[face]}
            onChange={handleChange}
            placeholder="Example: WWWWWWWWW"
            maxLength="9"
            style={{ textTransform: "uppercase", padding: "5px" }}
          />
        </div>
      ))}

      <br />

      <button onClick={solveCube} disabled={loading}>
        {loading ? "Solving..." : "Solve Cube"}
      </button>

      <h2>Solution:</h2>

      {solution.length === 0 && !loading && <p>No solution yet.</p>}

      {solution.map((step, index) => (
        <div key={index} style={{ margin: "5px" }}>
          <strong>Step {index + 1}:</strong> {step}
        </div>
      ))}
    </div>
  );
}

export default App;
