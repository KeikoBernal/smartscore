from pydantic import BaseModel
from typing import List, Optional, Union

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

class CompasAnalisisResponse(BaseModel):
    archivo: str
    instrumentos: List[str]
    compases: List[Union[CompasAnalisis, GlobalMetric]]

class ErrorResponse(BaseModel):
    error: str

CompasAnalisisUnion = Union[CompasAnalisisResponse, ErrorResponse]