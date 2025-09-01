from fastapi import APIRouter, Query, HTTPException
from backend.services.clasificador_metricas import (
    metricas_instrumentales,
    metricas_melodicas,
    metricas_ritmicas,
    metricas_armonicas,
    metricas_texturales,
    metricas_formales,
    metricas_interaccion,
    metricas_comparativas,
    metricas_diferenciadoras,
    metricas_todas
)
from music21 import converter
import pretty_midi
import os

router = APIRouter()

@router.get("/", response_model=dict)
async def obtener_metricas_por_categoria(
    archivo: str = Query(...),
    categoria: str = Query(..., description="Una de las 9 categorías disponibles o 'todos'"), # Actualizar descripción
    instrumento: str = Query(None),
    modo: str = Query("global", regex="^(global|compases|mixtas|todos)$")
):
    ruta = os.path.join("uploads", archivo)
    if not os.path.exists(ruta):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    try:
        score = converter.parse(ruta)
        midi = pretty_midi.PrettyMIDI(ruta)

        instrumento_param = instrumento if instrumento else None

        if categoria == "instrumentales":
            resultado = metricas_instrumentales(score, midi, instrumento=instrumento_param, modo=modo)
        elif categoria == "comparativas":
            resultado = metricas_comparativas(score, midi, instrumento=instrumento_param, modo=modo)
        elif categoria == "ritmicas":
            resultado = metricas_ritmicas(score, instrumento=instrumento_param, modo=modo)
        elif categoria == "formales":
            resultado = metricas_formales(score, modo=modo)
        elif categoria == "melodicas":
            resultado = metricas_melodicas(score, instrumento=instrumento_param, modo=modo)
        elif categoria == "armonicas":
            resultado = metricas_armonicas(score, instrumento=instrumento_param, modo=modo)
        elif categoria == "texturales":
            resultado = metricas_texturales(score, instrumento=instrumento_param, modo=modo)
        elif categoria == "interaccion":
            resultado = metricas_interaccion(score, midi, instrumento=instrumento_param, modo=modo)
        elif categoria == "diferenciadoras":
            resultado = metricas_diferenciadoras(score, instrumento=instrumento_param, modo=modo)
        elif categoria == "todos":
            resultado = metricas_todas(score, midi, instrumento=instrumento_param, modo=modo)
        else:
            raise HTTPException(status_code=400, detail=f"Categoría inválida: {categoria}")

        return {
            "archivo": archivo,
            "categoria": categoria,
            "instrumento": instrumento,
            "modo": modo,
            "metricas": resultado
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al calcular métricas: {str(e)}")
