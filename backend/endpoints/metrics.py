from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from services.parser import analizar_midi
import os

router = APIRouter()

@router.get("/{nombre_archivo}")
async def obtener_metricas(nombre_archivo: str, instrumentos: list[str] = Query(None)):
    ruta = os.path.join("uploads", nombre_archivo)
    if not os.path.exists(ruta):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})

    resultado = analizar_midi(nombre_archivo, instrumentos_seleccionados=instrumentos)
    return JSONResponse(content=resultado)