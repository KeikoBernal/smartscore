from fastapi import APIRouter, Query
from pathlib import Path
from music21 import converter
from backend.schemas.compas_metrics_schema import CompasAnalisisLote, CompasPorArchivo, CompasAnalisis
from backend.schemas.error_response import ErrorResponse
from backend.services.mixtas_parser import (
    notas_por_compas,
    compacidad_melodica_por_compas,
    entropia_duracion_por_compas,
    entropia_armonica_por_compas,
    densidad_armonica_por_compas,
    repetitividad_motívica_por_compas,
    promedio_notas_por_compas,
    varianza_notas_por_compas,
    entropia_compuesta_por_compas,
    seccion_aurea_por_compas,
    complejidad_total,
    dispersion_temporal_por_compas,
    sincronizacion_entrada_por_compas,
    variabilidad_intervalica_por_compas,
    promedio_rango_dinamico_por_compas
)
from backend.services.parser import (
    contrapunto_activo as contrapunto_activo_global,
    complejidad_total as complejidad_total_global,
    seccion_aurea as seccion_aurea_global,
    compases_no_vacios_por_instrumento
)
from typing import Union, List

router = APIRouter()
BASE_UPLOADS = Path(__file__).resolve().parent.parent.parent / "uploads"

@router.get("/", response_model=Union[CompasAnalisisLote, ErrorResponse])
def obtener_metricas_compases_lote(
    archivos: List[str] = Query(...),
    instrumentos: List[str] = Query(None)
):
    resultados = []
    errores = []

    for nombre_archivo in archivos:
        archivo = Path(nombre_archivo).name
        ruta = BASE_UPLOADS / archivo

        if not ruta.exists():
            errores.append({
                "error": "Archivo no encontrado",
                "archivo": archivo,
                "instrumentos": instrumentos or []
            })
            continue

        try:
            score = converter.parse(str(ruta))
            instrumentos_seleccionados = instrumentos or []

            compases_list = notas_por_compas(score, instrumentos_seleccionados)
            compacidad_list = compacidad_melodica_por_compas(score, instrumentos_seleccionados)
            entropia_duracion_list = entropia_duracion_por_compas(score, instrumentos_seleccionados)
            entropia_armonica_list = entropia_armonica_por_compas(score, instrumentos_seleccionados)
            densidad_armonica_list = densidad_armonica_por_compas(score, instrumentos_seleccionados)
            repetitividad_list = repetitividad_motívica_por_compas(score, instrumentos_seleccionados=instrumentos_seleccionados)
            promedio_notas_list = promedio_notas_por_compas(score, instrumentos_seleccionados)
            varianza_notas_list = varianza_notas_por_compas(score, instrumentos_seleccionados)
            entropia_compuesta_list = entropia_compuesta_por_compas(score, instrumentos_seleccionados)
            seccion_aurea_list = seccion_aurea_por_compas(score)
            dispersion_temporal_list = dispersion_temporal_por_compas(score, instrumentos_seleccionados)
            sincronizacion_entrada_list = sincronizacion_entrada_por_compas(score, None, instrumentos_seleccionados)
            variabilidad_intervalica_list = variabilidad_intervalica_por_compas(score, instrumentos_seleccionados)
            promedio_rango_dinamico_list = promedio_rango_dinamico_por_compas(None, score, instrumentos_seleccionados)

            compases_analisis = []
            for i in range(len(compases_list)):
                compas_data = CompasAnalisis(
                    numero=i+1,
                    duracion=score.parts[0].measure(i+1).duration.quarterLength if score.parts and score.parts[0].measure(i+1) else 0,
                    notas=list(compases_list[i].values())[0],
                    ambitus=None,  # Puedes agregar si tienes función para esto
                    complejidad_ritmica=None,
                    complejidad_ritmica_cuantificable=None,
                    direccionalidad_melodica=None,
                    polirritmia=None,
                    tipo_textura=None,
                    balance_dinamico=None,
                    solismo_vs_tutti=None,
                    simultaneidad_tematica=None,
                    contrapunto_activo=contrapunto_activo_global(score, instrumento=instrumentos_seleccionados[0]),
                    complejidad_total=complejidad_total(score, instrumento=instrumentos_seleccionados[0]) if instrumentos_seleccionados else complejidad_total_global(score),
                    seccion_aurea=seccion_aurea_list[i][f"compas #{i+1}"] if i < len(seccion_aurea_list) else None,
                    entropia_compuesta=entropia_compuesta_list[i][f"compas #{i+1}"] if i < len(entropia_compuesta_list) else None
                )
                compases_analisis.append(compas_data)

            resultados.append(CompasPorArchivo(
                archivo=archivo,
                instrumentos=instrumentos_seleccionados,
                compases=compases_analisis
            ))

        except Exception as e:
            errores.append({
                "error": f"Error al procesar el archivo MIDI: {str(e)}",
                "archivo": archivo,
                "instrumentos": instrumentos or []
            })

    if not resultados:
        return ErrorResponse(
            error="Sin resultados válidos",
            archivo="",
            instrumentos=instrumentos or []
        )

    return CompasAnalisisLote(resultados=resultados, errores=errores)