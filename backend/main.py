from fastapi import FastAPI
from routers import metrics, files

app = FastAPI(title="SmartScore API")
app.include_router(files.router, prefix="/api/files")
app.include_router(metrics.router, prefix="/api/metrics")