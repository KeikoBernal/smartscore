from fastapi import APIRouter, Query
from backend.schemas.global_metrics_schema import GlobalMetrics, MultiFileMetrics
from backend.schemas.error_response import ErrorResponse
from backend.services.parser import analizar_midi
from typing import Union, List
import os

router = APIRouter()

@router.get("/", response_model=Union[MultiFileMetrics, ErrorResponse])
async def obtener_metricas_multiples(
    archivos: List[str] = Query(...),
    instrumentos: List[str] = Query(None)
):
    resultados = []
    errores = []

    for nombre_archivo in archivos:
        ruta = os.path.join("uploads", nombre_archivo)
        if not os.path.exists(ruta):
            errores.append(ErrorResponse(
                error="Archivo no encontrado",
                archivo=nombre_archivo,
                instrumentos=instrumentos or []
            ))
            continue

        resultado = analizar_midi(nombre_archivo, instrumentos_seleccionados=instrumentos)
        if "error" in resultado:
            errores.append(ErrorResponse(
                error=resultado["error"],
                archivo=nombre_archivo,
                instrumentos=instrumentos or []
            ))
            continue

        campos_obligatorios = [
            "duracion_segundos", "tempo_promedio", "entropia_melodica",
            "entropia_ritmica", "entropia_armonica", "entropia_interaccion",
            "complejidad_total", "firma_metrica", "progresiones_armonicas",
            "contrapunto_activo", "familias_instrumentales",
            "partes_detectadas", "porcentaje_participacion",
            "cantidad_total_notas"
        ]

        if any(k not in resultado or resultado[k] is None for k in campos_obligatorios):
            errores.append(ErrorResponse(
                error="No se pudo calcular métricas globales",
                archivo=nombre_archivo,
                instrumentos=instrumentos or []
            ))
            continue

        resultados.append(GlobalMetrics(
            archivo=nombre_archivo,
            instrumentos=instrumentos or [],
            **{k: resultado[k] for k in campos_obligatorios}
        ))

    if not resultados:
        return errores[0] if errores else ErrorResponse(error="Sin resultados válidos", archivo="", instrumentos=[])

    return MultiFileMetrics(resultados=resultados, errores=errores)