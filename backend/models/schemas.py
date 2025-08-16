from pydantic import BaseModel
from typing import List

class Note(BaseModel):
    pitch: str
    start: float
    duration: float

class MusicData(BaseModel):
    notes: List[Note]
    instruments: List[str]
    metadata: dict