from fastapi import APIRouter
from fastapi.responses import JSONResponse
from services.parser import analizar_midi
import os

router = APIRouter()

@router.get("/{nombre_archivo}")
async def obtener_metricas(nombre_archivo: str):
    ruta = os.path.join("uploads", nombre_archivo)
    if not os.path.exists(ruta):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})

    resultado = analizar_midi(nombre_archivo)
    return JSONResponse(content=resultado)