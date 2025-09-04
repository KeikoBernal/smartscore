from pydantic import BaseModel
from typing import Dict, List, Union

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
    progresiones_armonicas: Dict[str, Dict[str, Union[str, int]]]  # Cambiado a dict con conteos
    contrapunto_activo: float
    familias_instrumentales: Dict[str, List[str]]
    partes_detectadas: List[ParteInfo]
    porcentaje_participacion: Dict[str, float]

    cantidad_total_notas: Dict[str, Union[int, Dict[str, int]]]
    compases_estimados: int
    motivos_recurrentes: Dict[str, Dict[str, Union[int, List[str]]]]
    intervalos_predominantes: Dict[str, Union[List[int], List[str]]]
    intervalos_todos: List[str]
    balance_dinamico: Dict[str, float]
    red_interaccion_musical: Dict[str, int]
    seccion_aurea: float
    variedad_tonal: int
    innovacion_estadistica: float
    firma_fractal: float

    cantidad_notas_por_compas: List[Dict[str, int]]  # Añadido para rítmicas

class ErrorResponse(BaseModel):
    error: str
    archivo: str
    instrumentos: List[str]

class MultiFileMetrics(BaseModel):
    resultados: List[GlobalMetrics]
    errores: List[ErrorResponse] = []