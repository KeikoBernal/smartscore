from fastapi import FastAPI
from endpoints import upload, metrics, compases

app = FastAPI(title="SmartScore API")

app.include_router(upload.router, prefix="/upload")
app.include_router(metrics.router, prefix="/metrics")
app.include_router(compases.router, prefix="/compases")