from pydantic import BaseModel
from typing import Dict, List

class MixtasMetricsResponse(BaseModel):
    archivo: str
    instrumentos: List[str]
    mixtas: Dict[str, float]