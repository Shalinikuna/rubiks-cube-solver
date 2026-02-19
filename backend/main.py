from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import kociemba

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CubeInput(BaseModel):
    cube_string: str


# 🔥 Convert notation to readable words
def convert_to_words(move):
    mapping = {
        "R": "Rotate Right Clockwise",
        "R'": "Rotate Right Counter-Clockwise",
        "R2": "Rotate Right Twice",

        "L": "Rotate Left Clockwise",
        "L'": "Rotate Left Counter-Clockwise",
        "L2": "Rotate Left Twice",

        "U": "Rotate Up Clockwise",
        "U'": "Rotate Up Counter-Clockwise",
        "U2": "Rotate Up Twice",

        "D": "Rotate Down Clockwise",
        "D'": "Rotate Down Counter-Clockwise",
        "D2": "Rotate Down Twice",

        "F": "Rotate Front Clockwise",
        "F'": "Rotate Front Counter-Clockwise",
        "F2": "Rotate Front Twice",

        "B": "Rotate Back Clockwise",
        "B'": "Rotate Back Counter-Clockwise",
        "B2": "Rotate Back Twice",
    }

    return mapping.get(move, move)


@app.get("/")
def home():
    return {"message": "Rubik's Cube Solver API is LIVE 🚀"}


@app.post("/solve")
def solve_cube(data: CubeInput):
    try:
        solution = kociemba.solve(data.cube_string)
        moves = solution.split()

        readable_steps = [convert_to_words(move) for move in moves]

        return {
            "solution_steps": readable_steps
        }

    except Exception:
        return {
            "error": "Invalid cube configuration"
        }
