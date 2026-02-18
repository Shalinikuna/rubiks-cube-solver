from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ----------------------------
# ✅ CORS (Allow frontend)
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# ✅ ROOT ENDPOINT
# ----------------------------
@app.get("/")
def home():
    return {
        "message": "Rubik's Cube Solver API is LIVE 🚀"
    }

# ----------------------------
# ✅ SCAN FACE
# ----------------------------
@app.post("/scan-face")
def scan_face(data: dict):
    # Dummy colors for now
    return {
        "colors": [
            "Red", "Blue", "Green",
            "White", "Yellow", "Orange",
            "Red", "Blue", "Green"
        ]
    }

# ----------------------------
# ✅ SOLVE CUBE
# ----------------------------
@app.get("/solve")
def solve_cube(cube: str):
    # Dummy solution
    return {
        "solution": "R U R' U'"
    }
