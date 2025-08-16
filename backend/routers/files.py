from fastapi import APIRouter, UploadFile, File
import uuid
from services.parser import parse_music_file
from services.calculator import compute_all_metrics

FILES_DB = {}  # simulación de almacenamiento en memoria

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    file_id = str(uuid.uuid4())
    music_data = parse_music_file(file.filename, content)
    FILES_DB[file_id] = music_data
    return {"success": True, "file_id": file_id}

@router.get("/{file_id}/{category}")
def get_metrics_by_category(file_id: str, category: str):
    if file_id not in FILES_DB:
        return {"success": False, "error": "Archivo no encontrado"}
    all_metrics = compute_all_metrics(FILES_DB[file_id])
    return {"success": True, "data": all_metrics.get(category, {})}