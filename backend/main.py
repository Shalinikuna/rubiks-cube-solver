from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
import cv2

app = FastAPI()

# ✅ CORS (VERY IMPORTANT FOR HOSTING)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later you can restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Request model
# -----------------------------
class ImageData(BaseModel):
    image: str


# -----------------------------
# SCAN FACE API
# -----------------------------
@app.post("/scan-face")
def scan_face(data: ImageData):
    try:
        # Remove header part from base64 string
        image_data = data.image.split(",")[1]
        image_bytes = base64.b64decode(image_data)

        # Convert to numpy array
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Dummy colors for now (you can improve detection later)
        detected_colors = [
            "White", "White", "White",
            "White", "White", "White",
            "White", "White", "White"
        ]

        return {"colors": detected_colors}

    except Exception as e:
        return {"error": str(e)}


# -----------------------------
# SOLVE CUBE API
# -----------------------------
@app.get("/solve")
def solve_cube(cube: str):
    # Dummy solution for now
    return {"solution": "R U R' U'"}
