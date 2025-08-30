from pydantic import BaseModel
from typing import List, Union, Dict
from backend.schemas.error_response import ErrorResponse

class CompasAnalisis(BaseModel):
    numero: int
    duracion: float
    notas: int
    ambitus: Dict[str, Union[int, float]]  # Mejor tipar dict
    complejidad_ritmica: float
    complejidad_ritmica_cuantificable: int
    direccionalidad_melodica: float
    polirritmia: Dict[str, Union[int, float]]
    tipo_textura: str
    balance_dinamico: float
    solismo_vs_tutti: str
    simultaneidad_tematica: int
    contrapunto_activo: int

class GlobalMetric(BaseModel):
    global_: Dict[str, Union[int, float, dict]]  # Puede contener métricas variadas

class CompasPorArchivo(BaseModel):
    archivo: str
    instrumentos: List[str]
    compases: List[Union[CompasAnalisis, GlobalMetric]]

class CompasAnalisisLote(BaseModel):
    resultados: List[CompasPorArchivo]
    errores: List[ErrorResponse] = []