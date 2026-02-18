from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- MODEL --------
class ImageData(BaseModel):
    image: str


# -------- SCAN FACE --------
@app.post("/scan-face")
def scan_face(data: ImageData):
    # For now we simulate color detection
    possible_colors = ["White", "Yellow", "Red", "Orange", "Blue", "Green"]

    colors = [random.choice(possible_colors) for _ in range(9)]

    print("Detected Colors:", colors)

    return {"colors": colors}


# -------- SOLVE CUBE --------
@app.get("/solve")
def solve_cube(cube: str):
    # Dummy solution for now
    return {"solution": "R U R' U'"}
