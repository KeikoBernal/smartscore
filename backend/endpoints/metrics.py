from fastapi import APIRouter, Query
from backend.schemas.global_metrics_schema import GlobalMetrics
from backend.schemas.error_response import ErrorResponse
from backend.services.parser import analizar_midi
from typing import Union
import os

router = APIRouter()

@router.get("/{nombre_archivo}", response_model=Union[GlobalMetrics, ErrorResponse])
async def obtener_metricas(nombre_archivo: str, instrumentos: list[str] = Query(None)):
    ruta = os.path.join("uploads", nombre_archivo)
    if not os.path.exists(ruta):
        return ErrorResponse(
            error="Archivo no encontrado",
            archivo=nombre_archivo,
            instrumentos=instrumentos or []
        )

    resultado = analizar_midi(nombre_archivo, instrumentos_seleccionados=instrumentos)
    if "error" in resultado:
        return ErrorResponse(
            error=resultado["error"],
            archivo=nombre_archivo,
            instrumentos=instrumentos or []
        )

    campos_obligatorios = [
        "duracion_segundos", "tempo_promedio", "entropia_melodica",
        "entropia_ritmica", "entropia_armonica", "entropia_interaccion",
        "complejidad_total", "firma_metrica", "progresiones_armonicas",
        "contrapunto_activo", "familias_instrumentales"
    ]

    if any(k not in resultado or resultado[k] is None for k in campos_obligatorios):
        return ErrorResponse(
            error="No se pudo calcular métricas globales",
            archivo=nombre_archivo,
            instrumentos=instrumentos or []
        )

    return GlobalMetrics(
        archivo=nombre_archivo,
        instrumentos=instrumentos or [],
        **{k: resultado[k] for k in campos_obligatorios}
    )