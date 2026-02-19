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

@app.get("/")
def home():
    return {"message": "Rubik's Cube Solver API is LIVE 🚀"}

@app.post("/solve")
def solve_cube(data: CubeInput):
    try:
        solution = kociemba.solve(data.cube_string)
        steps = solution.split(" ")
        return {
            "solution_steps": steps
        }
    except Exception as e:
        return {"error": "Invalid cube configuration"}
