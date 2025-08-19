from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from services.mixtas_parser import analizar_mixtas
import os
import traceback

router = APIRouter()

@router.get("/{nombre_archivo}")
async def obtener_metricas_mixtas(nombre_archivo: str, instrumentos: list[str] = Query(None)):
    ruta = os.path.join("uploads", nombre_archivo)
    if not os.path.exists(ruta):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})

    try:
        resultado = analizar_mixtas(ruta, instrumentos_seleccionados=instrumentos)
        return JSONResponse(content=resultado)
    except Exception as e:
        print("⛔ ERROR en analizar_mixtas:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})