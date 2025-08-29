from pydantic import BaseModel
from typing import List, Union, Dict
from backend.schemas.error_response import ErrorResponse

class CompasAnalisis(BaseModel):
    numero: int
    duracion: float
    notas: int
    ambitus: dict
    complejidad_ritmica: float
    complejidad_ritmica_cuantificable: int
    direccionalidad_melodica: float
    polirritmia: dict
    tipo_textura: str
    balance_dinamico: float
    solismo_vs_tutti: str
    simultaneidad_tematica: int
    contrapunto_activo: int

class GlobalMetric(BaseModel):
    global_: dict  # Evita conflicto con palabra reservada 'global'

class CompasPorArchivo(BaseModel):
    archivo: str
    instrumentos: List[str]
    compases: List[Union[CompasAnalisis, GlobalMetric]]

class CompasAnalisisLote(BaseModel):
    resultados: List[CompasPorArchivo]
    errores: List[ErrorResponse] = []