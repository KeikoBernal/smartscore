from fastapi import FastAPI
from app.routers import upload, metrics

app = FastAPI(title="SmartScore API")

app.include_router(upload.router)
app.include_router(metrics.router)