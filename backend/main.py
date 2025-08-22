from fastapi import FastAPI
from backend.endpoints import upload, metrics, compases, mixtas
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="SmartScore API")

app.include_router(upload.router, prefix="/upload")
app.include_router(metrics.router, prefix="/metrics")
app.include_router(compases.router, prefix="/compases")
app.include_router(mixtas.router, prefix="/mixtas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Cambia según el puerto de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
