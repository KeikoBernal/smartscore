from pydantic import BaseModel
from typing import Dict, List, Union

class ErrorResponse(BaseModel):
    error: str
    detail: str = None

class MixtasPorArchivo(BaseModel):
    archivo: str
    instrumentos: List[str]
    mixtas: Dict[str, Union[float, List[Dict[str, float]], List[Dict[str, List[str]]], List[Dict[str, int]]]]  # Añadido List[Dict[str, int]] para cantidad_notas_por_compas

class MixtasMetricsLote(BaseModel):
    resultados: List[MixtasPorArchivo]
    errores: List[ErrorResponse] = []