from fastapi import APIRouter, HTTPException
from pathlib import Path
from backend.services.compas_parser import analizar_compases
from backend.schemas.compas_metrics_schema import CompasAnalisisResponse, ErrorResponse
from typing import Union

router = APIRouter()

BASE_UPLOADS = Path(__file__).resolve().parent.parent.parent / "uploads"

@router.get("/{nombre_archivo}", response_model=Union[CompasAnalisisResponse, ErrorResponse])
def obtener_metricas_compases(nombre_archivo: str):
    archivo = Path(nombre_archivo).name
    ruta = BASE_UPLOADS / archivo

    print(f"[DEBUG] Buscando archivo en: {ruta.resolve()}")

    if not ruta.exists():
        return ErrorResponse(
            error="Archivo no encontrado",
            archivo=archivo,
            instrumentos=[]
        )

    try:
        resultado = analizar_compases(str(ruta))
        instrumentos = []  # Puedes extraerlos si lo deseas

        return CompasAnalisisResponse(
            archivo=archivo,
            instrumentos=instrumentos,
            compases=resultado
        )

    except Exception as e:
        print(f"[ERROR] Fallo al analizar compases: {e}")
        return ErrorResponse(
            error="Error al procesar el archivo MIDI",
            archivo=archivo,
            instrumentos=[]
        )