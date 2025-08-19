from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CompasMetric(BaseModel):
    número: int
    instrumental: Dict[str, Optional[Any]]
    melódicas: Dict[str, Optional[Any]]
    rítmicas: Dict[str, Optional[Any]]
    armónicas: Dict[str, Optional[Any]]
    texturales: Dict[str, Optional[Any]]

class GlobalMetric(BaseModel):
    instrumental: Dict[str, Optional[Any]]
    melódicas: Dict[str, Optional[Any]]
    rítmicas: Dict[str, Optional[Any]]
    armónicas: Dict[str, Optional[Any]]
    texturales: Dict[str, Optional[Any]]
    comparativas: Dict[str, Optional[Any]]

class MetricResponse(BaseModel):
    archivo: str
    metadata: Dict[str, Optional[Any]]
    compases: List[CompasMetric]
    global_: GlobalMetric