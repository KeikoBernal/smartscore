from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.endpoints import (
    upload, metrics, compases, mixtas,
    instrumentos, clasificador_metricas_endpoint
)

app = FastAPI(title="SmartScore API")

app.include_router(upload.router, prefix="/upload")
app.include_router(metrics.router, prefix="/metrics")
app.include_router(compases.router, prefix="/compases")
app.include_router(mixtas.router, prefix="/mixtas")
app.include_router(instrumentos.router, prefix="/instrumentos")
app.include_router(clasificador_metricas_endpoint.router, prefix="/metricas")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import multiprocessing
    import uvicorn
    multiprocessing.freeze_support()
    uvicorn.run(app, host="127.0.0.1", port=8000)