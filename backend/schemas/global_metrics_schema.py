from pydantic import BaseModel
from typing import Dict, List

class ParteInfo(BaseModel):
    nombre: str
    notas: int

class GlobalMetrics(BaseModel):
    archivo: str
    instrumentos: List[str]
    duracion_segundos: float
    tempo_promedio: float
    entropia_melodica: float
    entropia_ritmica: float
    entropia_armonica: float
    entropia_interaccion: float
    complejidad_total: float
    firma_metrica: Dict[float, int]
    progresiones_armonicas: List[str]
    contrapunto_activo: float
    familias_instrumentales: Dict[str, List[str]]
    partes_detectadas: List[ParteInfo]
    porcentaje_participacion: Dict[str, float]
    cantidad_total_notas: int