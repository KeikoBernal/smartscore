from fastapi import APIRouter
router = APIRouter(prefix="/metrics", tags=["metrics"])

@router.get("/{piece_id}")
async def list_metrics(piece_id: str):
    return [{"id": "density", "name": "Densidad"}]