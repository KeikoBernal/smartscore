from fastapi import FastAPI
from backend.endpoints import (
    upload,
    metrics,
    compases,
    mixtas,
    instrumentos,
    clasificador_metricas_endpoint  # ✅ asegúrate de que este archivo exista en endpoints/
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SmartScore API")

# ✅ Registro de routers
app.include_router(upload.router, prefix="/upload")
app.include_router(metrics.router, prefix="/metrics")
app.include_router(compases.router, prefix="/compases")
app.include_router(mixtas.router, prefix="/mixtas")
app.include_router(instrumentos.router, prefix="/instrumentos")
app.include_router(clasificador_metricas_endpoint.router, prefix="/metricas")  # ✅ nuevo endpoint

# ✅ Configuración de CORS para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ajusta si tu frontend usa otro puerto
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)