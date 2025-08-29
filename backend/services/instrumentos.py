import os
from music21 import converter

def extraer_instrumentos(nombre_archivo: str) -> list[str]:
    """
    Extrae los nombres de las partes musicales (instrumentos) desde un archivo MIDI.
    Retorna una lista de nombres únicos, normalizados y sin duplicados.
    """
    ruta = os.path.join("uploads", nombre_archivo)
    if not os.path.exists(ruta):
        raise FileNotFoundError(f"Archivo no encontrado: {nombre_archivo}")

    try:
        score = converter.parse(ruta)
        nombres = [
            (p.partName or "Parte sin nombre").strip()
            for p in score.parts
        ]
        # Elimina duplicados preservando orden
        return list(dict.fromkeys(nombres))
    except Exception as e:
        raise RuntimeError(f"Error al extraer instrumentos: {str(e)}")