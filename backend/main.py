from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Rubik's Cube Scanner API is LIVE 🚀"}


# Store faces temporarily
cube_faces = []


@app.post("/scan-face")
def scan_face():
    global cube_faces

    # Dummy detected face (replace later with real detection)
    detected_face = [
        "Red", "Blue", "Green",
        "White", "Yellow", "Orange",
        "Red", "Blue", "Green"
    ]

    cube_faces.append(detected_face)

    return {
        "face_number": len(cube_faces),
        "face_colors": detected_face
    }


@app.get("/solve")
def solve_cube():
    # Dummy algorithm
    moves = ["R", "U", "R'", "U'"]

    readable_steps = []

    for move in moves:
        if move == "R":
            readable_steps.append("Rotate Right face clockwise")
        elif move == "R'":
            readable_steps.append("Rotate Right face anti-clockwise")
        elif move == "U":
            readable_steps.append("Rotate Upper face clockwise")
        elif move == "U'":
            readable_steps.append("Rotate Upper face anti-clockwise")

    return {
        "faces_scanned": len(cube_faces),
        "steps": readable_steps
    }
