from pydantic import BaseModel
from typing import Dict, List

class MixtasPorArchivo(BaseModel):
    archivo: str
    instrumentos: List[str]
    mixtas: Dict[str, float]

class MixtasMetricsLote(BaseModel):
    resultados: List[MixtasPorArchivo]