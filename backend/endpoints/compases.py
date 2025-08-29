from fastapi import APIRouter, Query
from pathlib import Path
from backend.services.compas_parser import analizar_compases
from backend.schemas.compas_metrics_schema import CompasAnalisisLote, CompasPorArchivo
from backend.schemas.error_response import ErrorResponse
from typing import Union, List
import traceback

router = APIRouter()
BASE_UPLOADS = Path(__file__).resolve().parent.parent.parent / "uploads"

@router.get("/", response_model=Union[CompasAnalisisLote, ErrorResponse])
def obtener_metricas_compases_lote(
    archivos: List[str] = Query(...),
    instrumentos: List[str] = Query(None)
):
    resultados: List[CompasPorArchivo] = []
    errores: List[ErrorResponse] = []

    for nombre_archivo in archivos:
        archivo = Path(nombre_archivo).name
        ruta = BASE_UPLOADS / archivo

        print(f"[DEBUG] Buscando archivo en: {ruta.resolve()}")

        if not ruta.exists():
            errores.append(ErrorResponse(
                error="Archivo no encontrado",
                archivo=archivo,
                instrumentos=instrumentos or []
            ))
            continue

        try:
            resultado = analizar_compases(str(ruta), instrumentos_seleccionados=instrumentos)
            resultados.append(CompasPorArchivo(
                archivo=archivo,
                instrumentos=instrumentos or [],
                compases=resultado
            ))
        except Exception as e:
            print(f"[ERROR] Fallo al analizar compases: {e}")
            errores.append(ErrorResponse(
                error="Error al procesar el archivo MIDI",
                archivo=archivo,
                instrumentos=instrumentos or []
            ))

    if not resultados:
        return errores[0] if errores else ErrorResponse(
            error="Sin resultados válidos",
            archivo="",
            instrumentos=instrumentos or []
        )

    return CompasAnalisisLote(resultados=resultados, errores=errores)