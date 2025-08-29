from fastapi import APIRouter, Query
from backend.schemas.mixtas_metrics_schema import MixtasMetricsLote, MixtasPorArchivo
from backend.schemas.error_response import ErrorResponse
from backend.services.mixtas_parser import analizar_mixtas
from typing import Union, List
import os
import traceback

router = APIRouter()

@router.get("/", response_model=Union[MixtasMetricsLote, ErrorResponse])
async def obtener_metricas_mixtas_lote(
    archivos: List[str] = Query(...),
    instrumentos: List[str] = Query(None)
):
    resultados: List[MixtasPorArchivo] = []
    errores: List[ErrorResponse] = []

    for nombre_archivo in archivos:
        ruta = os.path.join("uploads", nombre_archivo)
        if not os.path.exists(ruta):
            errores.append(ErrorResponse(
                error="Archivo no encontrado",
                archivo=nombre_archivo,
                instrumentos=instrumentos or []
            ))
            continue

        try:
            resultado = analizar_mixtas(ruta, instrumentos_seleccionados=instrumentos)
            resultados.append(MixtasPorArchivo(
                archivo=nombre_archivo,
                instrumentos=instrumentos or [],
                mixtas=resultado
            ))
        except Exception as e:
            traceback.print_exc()
            errores.append(ErrorResponse(
                error=f"Error al procesar métricas mixtas: {str(e)}",
                archivo=nombre_archivo,
                instrumentos=instrumentos or []
            ))

    if not resultados:
        return errores[0] if errores else ErrorResponse(
            error="Sin resultados válidos",
            archivo="",
            instrumentos=instrumentos or []
        )

    return MixtasMetricsLote(resultados=resultados, errores=errores)