from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import base64

app = FastAPI()

# ✅ Enable CORS (so frontend can call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Root endpoint
@app.get("/")
def home():
    return {"message": "Rubik's Cube Solver API is LIVE 🚀"}

# ===============================
# 📷 Scan Face (Receives Image)
# ===============================
@app.post("/scan-face")
async def scan_face(data: dict = Body(...)):
    image_data = data.get("image")

    if not image_data:
        return {"error": "No image received"}

    # Remove base64 header
    try:
        header, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)
    except Exception:
        return {"error": "Invalid image format"}

    # For now → returning dummy colors
    return {
        "colors": [
            "Red", "Blue", "Green",
            "White", "Yellow", "Orange",
            "Red", "Blue", "Green"
        ]
    }

# ===============================
# 🧠 Solve Cube (Dummy)
# ===============================
@app.get("/solve")
def solve_cube():
    return {"solution": "R U R' U'"}
