import os

def ruta_archivo(nombre: str) -> str:
    return os.path.join("data", "uploads", os.path.basename(nombre))