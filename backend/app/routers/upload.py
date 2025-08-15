from fastapi import APIRouter, UploadFile, File
router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/")
async def upload_score(score_file: UploadFile = File(...)):
    return {"filename": score_file.filename}