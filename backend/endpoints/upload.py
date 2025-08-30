from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
import os
import shutil

router = APIRouter()

@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"mensaje": "Archivo recibido", "nombre": file.filename}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Error al subir archivo: {str(e)}"}
        )
