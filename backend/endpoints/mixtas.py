from fastapi import APIRouter, Query
from backend.schemas.mixtas_metrics_schema import MixtasMetricsResponse
from backend.schemas.error_response import ErrorResponse
from backend.services.mixtas_parser import analizar_mixtas
from typing import Union
import os
import traceback

router = APIRouter()

@router.get("/{nombre_archivo}", response_model=Union[MixtasMetricsResponse, ErrorResponse])
async def obtener_metricas_mixtas(nombre_archivo: str, instrumentos: list[str] = Query(None)):
    ruta = os.path.join("uploads", nombre_archivo)
    if not os.path.exists(ruta):
        return ErrorResponse(
            error="Archivo no encontrado",
            archivo=nombre_archivo,
            instrumentos=instrumentos or []
        )

    try:
        resultado = analizar_mixtas(ruta, instrumentos_seleccionados=instrumentos)
        return MixtasMetricsResponse(
            archivo=nombre_archivo,
            instrumentos=instrumentos or [],
            mixtas=resultado
        )
    except Exception as e:
        traceback.print_exc()
        return ErrorResponse(
            error=f"Error al procesar métricas mixtas: {str(e)}",
            archivo=nombre_archivo,
            instrumentos=instrumentos or []
        )