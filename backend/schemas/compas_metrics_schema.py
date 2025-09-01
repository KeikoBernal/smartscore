from pydantic import BaseModel
from typing import List, Dict, Union, Optional

class AmbitusMetrics(BaseModel):
    min_pitch: Optional[int]
    max_pitch: Optional[int]
    range: Optional[int]

class PolirritmiaMetrics(BaseModel):
    valor: Optional[float]

class CompasAnalisis(BaseModel):
    numero: int
    duracion: float
    notas: int
    ambitus: Optional[AmbitusMetrics] = None
    complejidad_ritmica: Optional[float] = None
    complejidad_ritmica_cuantificable: Optional[int] = None
    direccionalidad_melodica: Optional[float] = None
    polirritmia: Optional[PolirritmiaMetrics] = None
    tipo_textura: Optional[str] = None
    balance_dinamico: Optional[float] = None
    solismo_vs_tutti: Optional[str] = None
    simultaneidad_tematica: Optional[int] = None
    contrapunto_activo: Optional[float] = None  # Ahora puede ser float por instrumento
    complejidad_total: Optional[float] = None
    seccion_aurea: Optional[float] = None
    entropia_compuesta: Optional[float] = None

class CompasPorArchivo(BaseModel):
    archivo: str
    instrumentos: List[str]
    compases: List[CompasAnalisis]

class CompasAnalisisLote(BaseModel):
    resultados: List[CompasPorArchivo]
    errores: Optional[List[Dict[str, Union[str, List[str]]]]] = []