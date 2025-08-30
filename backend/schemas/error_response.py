from pydantic import BaseModel
from typing import List

class ErrorResponse(BaseModel):
    error: str
    archivo: str
    instrumentos: List[str]
