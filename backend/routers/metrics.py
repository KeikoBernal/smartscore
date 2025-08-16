from fastapi import APIRouter, UploadFile, File
from services.parser import parse_music_file
from services.calculator import compute_all_metrics

router = APIRouter()

@router.post("/metrics/")
async def upload_music_file(file: UploadFile = File(...)):
    content = await file.read()
    music_data = parse_music_file(file.filename, content)
    results = compute_all_metrics(music_data)
    return results