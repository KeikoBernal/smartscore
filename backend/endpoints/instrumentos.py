from fastapi import APIRouter, Query, HTTPException
from backend.services.instrumentos import extraer_instrumentos

router = APIRouter()

@router.get("/", response_model=list[str])
async def obtener_instrumentos(archivo: str = Query(...)):
    """
    Devuelve la lista de instrumentos detectados en el archivo MIDI.
    """
    try:
        instrumentos = extraer_instrumentos(archivo)
        if not instrumentos:
            raise HTTPException(status_code=404, detail="No se detectaron instrumentos en el archivo")
        return instrumentos
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al extraer instrumentos: {str(e)}")
