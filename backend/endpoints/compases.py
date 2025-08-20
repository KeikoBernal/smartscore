from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from services.compas_parser import analizar_compases
import os
import traceback

router = APIRouter()

@router.get("/{nombre_archivo}")
async def obtener_compases(nombre_archivo: str, instrumentos: list[str] = Query(None)):
    ruta = os.path.join("uploads", nombre_archivo)
    if not os.path.exists(ruta):
        return JSONResponse(status_code=404, content={"error": "Archivo no encontrado"})

    try:
        resultado = analizar_compases(nombre_archivo, instrumentos_seleccionados=instrumentos)
        return JSONResponse(content=resultado)
    except Exception as e:
        print("⛔ ERROR en analizar_compases:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})