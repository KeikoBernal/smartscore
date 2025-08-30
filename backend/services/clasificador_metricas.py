from backend.services.parser import (
    instrumentos_detectados, cantidad_total_notas, partes_detectadas,
    participacion_por_partes, clasificar_familias, balance_dinamico,
    motivos_recurrentes, intervalos_predominantes, progresiones_armonicas,
    entropia_melodica, entropia_ritmica, entropia_armonica, entropia_interaccion,
    complejidad_total, firma_metrica, seccion_aurea, variedad_tonal,
    innovacion_estadistica, firma_fractal, contrapunto_activo, red_interaccion
)
from backend.services.mixtas_parser import (
    compacidad_melodica, repetitividad_motívica, densidad_armonica,
    variabilidad_intervalica, promedio_notas_por_compas, varianza_notas_por_compas,
    promedio_rango_dinamico, entropia_duracion_por_compas, sincronizacion_entrada,
    dispersion_temporal_por_compas, compacidad_melodica_por_compas, repetitividad_motívica_por_compas,
    notas_por_compas, entropia_armonica_por_compas,
    densidad_armonica_por_compas, sincronizacion_entrada_por_compas,
    dispersion_temporal_por_compas, promedio_rango_dinamico_por_compas,
    variabilidad_intervalica_por_compas
)

def blindar(func, *args, nombre=None, **kwargs):
    try:
        return func(*args, **kwargs)
    except Exception as e:
        return f"[ERROR en {nombre}]: {str(e)}"

def fusionar_metricas(score, midi=None, instrumento=None, funcion=None):
    resultado = {}
    for submodo in ["global", "mixtas", "compases"]:
        try:
            if midi:
                resultado.update(funcion(score, midi, instrumento, submodo))
            else:
                resultado.update(funcion(score, instrumento, submodo))
        except Exception as e:
            resultado[f"[ERROR en {submodo}]"] = str(e)
    return resultado

def fusionar_metricas_simple(score, funcion):
    resultado = {}
    for submodo in ["global", "mixtas", "compases"]:
        try:
            resultado.update(funcion(score, submodo))
        except Exception as e:
            resultado[f"[ERROR en {submodo}]"] = str(e)
    return resultado

def metricas_instrumentales(score, midi, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, midi, instrumento, metricas_instrumentales)

    resultado = {}

    if modo == "global":
        resultado["instrumentos_detectados"] = blindar(instrumentos_detectados, score, nombre="instrumentos_detectados")
        resultado["cantidad_total_notas"] = blindar(cantidad_total_notas, score, nombre="cantidad_total_notas")
        resultado["partes_detectadas"] = blindar(partes_detectadas, score, nombre="partes_detectadas")

    if modo == "mixtas":
        resultado["porcentaje_participacion"] = blindar(participacion_por_partes, score, nombre="porcentaje_participacion")
        resultado["familias_instrumentales"] = blindar(clasificar_familias, score, nombre="familias_instrumentales")

    if modo == "compases":
        resultado["balance_dinamico"] = blindar(balance_dinamico, midi, instrumento=instrumento, nombre="balance_dinamico")

    return resultado

def metricas_melodicas(score, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, None, instrumento, metricas_melodicas)

    resultado = {}

    if modo == "global":
        resultado["entropia_melodica"] = blindar(entropia_melodica, score, nombre="entropia_melodica")
        resultado["intervalos_predominantes"] = blindar(intervalos_predominantes, score, instrumento=instrumento, nombre="intervalos_predominantes")
        resultado["motivos_recurrentes"] = blindar(motivos_recurrentes, score, instrumento=instrumento, nombre="motivos_recurrentes")
        resultado["variedad_tonal"] = blindar(variedad_tonal, score, nombre="variedad_tonal")

    if modo == "mixtas":
        resultado["compacidad_melodica"] = blindar(compacidad_melodica, score, nombre="compacidad_melodica")
        resultado["repetitividad_motívica"] = blindar(repetitividad_motívica, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="repetitividad_motívica")

    if modo == "compases":
        resultado["promedio_notas_por_compas"] = blindar(promedio_notas_por_compas, score, nombre="promedio_notas_por_compas")
        resultado["varianza_notas_por_compas"] = blindar(varianza_notas_por_compas, score, nombre="varianza_notas_por_compas")
        resultado["compacidad_melodica_por_compas"] = blindar(compacidad_melodica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="compacidad_melodica_por_compas")
        resultado["repetitividad_motívica_por_compas"] = blindar(repetitividad_motívica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="repetitividad_motívica_por_compas")
        resultado["cantidad_notas_por_compas"] = blindar(notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="cantidad_notas_por_compas")

    return resultado

def metricas_ritmicas(score, modo="global"):
    resultado = {}

    if modo == "todos":
        for submodo in ["global", "mixtas", "compases"]:
            try:
                resultado.update(metricas_ritmicas(score, submodo))
            except Exception as e:
                resultado[f"[ERROR en {submodo}]"] = str(e)
        return resultado

    if modo == "global":
        resultado["entropia_ritmica"] = blindar(entropia_ritmica, score, nombre="entropia_ritmica")
        resultado["firma_metrica"] = blindar(firma_metrica, score, nombre="firma_metrica")
        resultado["entropia_duracion"] = blindar(entropia_duracion_por_compas, score, nombre="entropia_duracion")

    if modo == "mixtas":
        resultado["entropia_duracion"] = blindar(entropia_duracion_por_compas, score, nombre="entropia_duracion")

    if modo == "compases":
        resultado["promedio_notas_por_compas"] = blindar(promedio_notas_por_compas, score, nombre="promedio_notas_por_compas")
        resultado["varianza_notas_por_compas"] = blindar(varianza_notas_por_compas, score, nombre="varianza_notas_por_compas")
        resultado["entropia_duracion_por_compas"] = blindar(entropia_duracion_por_compas, score, nombre="entropia_duracion_por_compas")

    return resultado

def metricas_armonicas(score, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, None, instrumento, metricas_armonicas)

    resultado = {}

    if modo == "global":
        resultado["entropia_armonica"] = blindar(entropia_armonica, score, nombre="entropia_armonica")
        resultado["progresiones_armonicas"] = blindar(progresiones_armonicas, score, instrumento=instrumento, nombre="progresiones_armonicas")

    if modo == "mixtas":
        resultado["densidad_armonica"] = blindar(densidad_armonica, score, nombre="densidad_armonica")
        resultado["innovacion_estadistica"] = blindar(innovacion_estadistica, score, nombre="innovacion_estadistica")

    if modo == "compases":
        resultado["densidad_armonica"] = blindar(densidad_armonica, score, nombre="densidad_armonica")
        resultado["entropia_armonica_por_compas"] = blindar(entropia_armonica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="entropia_armonica_por_compas")
        # Si necesitas progresiones_armonicas_por_compas, define la función en parser.py o mixtas_parser.py y luego impórtala.
        # resultado["progresiones_armonicas_por_compas"] = blindar(progresiones_armonicas_por_compas, score, instrumento=instrumento, nombre="progresiones_armonicas_por_compas")
        resultado["densidad_armonica_por_compas"] = blindar(densidad_armonica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="densidad_armonica_por_compas")

    return resultado

def metricas_texturales(score, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, None, instrumento, metricas_texturales)

    resultado = {}

    if modo == "global":
        resultado["contrapunto_activo"] = blindar(contrapunto_activo, score, instrumento=instrumento, nombre="contrapunto_activo")
        resultado["firma_fractal"] = blindar(firma_fractal, score, nombre="firma_fractal")

    if modo == "mixtas":
        resultado["complejidad_total"] = blindar(complejidad_total, score, nombre="complejidad_total")

    if modo == "compases":
        resultado["complejidad_total"] = blindar(complejidad_total, score, nombre="complejidad_total")
        resultado["contrapunto_activo"] = blindar(contrapunto_activo, score, instrumento=instrumento, nombre="contrapunto_activo")
        # Si tienes funciones por compás (contrapunto_activo_por_compas, firma_fractal_por_compas, complejidad_total_por_compas), defínelas o elimínalas.
        # resultado["contrapunto_activo_por_compas"] = blindar(contrapunto_activo_por_compas, score, instrumento=instrumento, nombre="contrapunto_activo_por_compas")
        # resultado["firma_fractal_por_compas"] = blindar(firma_fractal_por_compas, score, instrumento=instrumento, nombre="firma_fractal_por_compas")
        # resultado["complejidad_total_por_compas"] = blindar(complejidad_total_por_compas, score, instrumento=instrumento, nombre="complejidad_total_por_compas")

    return resultado

def metricas_formales(score, modo="global"):
    resultado = {}

    if modo == "todos":
        for submodo in ["global", "mixtas", "compases"]:
            try:
                resultado.update(metricas_formales(score, submodo))
            except Exception as e:
                resultado[f"[ERROR en {submodo}]"] = str(e)
        return resultado

    if modo == "global":
        resultado["seccion_aurea"] = blindar(seccion_aurea, score, nombre="seccion_aurea")

    if modo == "mixtas":
        resultado["seccion_aurea"] = blindar(seccion_aurea, score, nombre="seccion_aurea")
        resultado["compases_estimados"] = blindar(lambda s: int(s.highestTime / (60 / 120) / 4), score, nombre="compases_estimados")

    if modo == "compases":
        resultado["compases_estimados"] = blindar(lambda s: int(s.highestTime / (60 / 120) / 4), score, nombre="compases_estimados")
        # Si tienes función seccion_aurea_por_compas, defínela o elimínala.
        # resultado["seccion_aurea_por_compas"] = blindar(seccion_aurea_por_compas, score, nombre="seccion_aurea_por_compas")

    return resultado

def metricas_interaccion(score, midi, instrumento=None, modo="global"):
    resultado = {}
    
    if modo == "todos":
        return {
            **metricas_interaccion(score, midi, instrumento, "global"),
            **metricas_interaccion(score, midi, instrumento, "mixtas"),
            **metricas_interaccion(score, midi, instrumento, "compases")
        }

    if modo == "global":
        resultado["entropia_interaccion"] = blindar(entropia_interaccion, score, nombre="entropia_interaccion")
        resultado["red_interaccion_musical"] = blindar(red_interaccion, score, instrumento=instrumento, nombre="red_interaccion_musical")

    if modo == "mixtas":
        resultado["sincronizacion_entrada"] = blindar(
            sincronizacion_entrada,
            midi,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="sincronizacion_entrada"
        )
        resultado["dispersion_temporal"] = blindar(
            dispersion_temporal_por_compas,
            score,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="dispersion_temporal"
        )

    if modo == "compases":
        resultado["dispersion_temporal"] = blindar(
            dispersion_temporal_por_compas,
            score,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="dispersion_temporal"
        )
        resultado["sincronizacion_entrada_por_compas"] = blindar(sincronizacion_entrada_por_compas, score, midi, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="sincronizacion_entrada_por_compas")
        resultado["dispersion_temporal_por_compas"] = blindar(dispersion_temporal_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="dispersion_temporal_por_compas")

    return resultado

def metricas_comparativas(score, midi, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, midi, instrumento, metricas_comparativas)

    resultado = {}

    if modo == "global":
        resultado["tempo_promedio"] = blindar(lambda m: m.estimate_tempo(), midi, nombre="tempo_promedio")
        resultado["duracion_segundos"] = blindar(lambda m: m.get_end_time(), midi, nombre="duracion_segundos")

    if modo in ["mixtas", "compases"]:
        resultado["promedio_rango_dinamico"] = blindar(
            promedio_rango_dinamico,
            midi,
            len(score.parts[0].getElementsByClass('Measure')),
            [instrumento] if instrumento else None,
            nombre="promedio_rango_dinamico"
        )
        resultado["promedio_rango_dinamico_por_compas"] = blindar(promedio_rango_dinamico_por_compas, midi, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="promedio_rango_dinamico_por_compas")

    return resultado

def metricas_diferenciadoras(score, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, None, instrumento, metricas_diferenciadoras)

    resultado = {}

    if modo in ["global", "mixtas", "compases"]:
        resultado["variabilidad_intervalica"] = blindar(
            variabilidad_intervalica,
            score,
            [instrumento] if instrumento else None,
            nombre="variabilidad_intervalica"
        )
        resultado["variabilidad_intervalica_por_compas"] = blindar(variabilidad_intervalica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="variabilidad_intervalica_por_compas")

    if modo == "global":
        resultado["entropia_compuesta"] = blindar(
            lambda s: round(sum([
                entropia_melodica(s),
                entropia_ritmica(s),
                entropia_armonica(s)
            ]) / 3, 3),
            score,
            nombre="entropia_compuesta"
        )

    if modo in ["mixtas", "compases"]:
        resultado["entropia_compuesta"] = blindar(
            lambda s: round(sum([
                entropia_melodica(s),
                entropia_ritmica(s),
                entropia_armonica(s)
            ]) / 3, 3),
            score,
            nombre="entropia_compuesta"
        )

    return resultado

def metricas_interaccion(score, midi, instrumento=None, modo="global"):
    resultado = {}
    
    if modo == "todos":
        return {
            **metricas_interaccion(score, midi, instrumento, "global"),
            **metricas_interaccion(score, midi, instrumento, "mixtas"),
            **metricas_interaccion(score, midi, instrumento, "compases")
        }

    if modo == "global":
        resultado["entropia_interaccion"] = blindar(entropia_interaccion, score, nombre="entropia_interaccion")
        resultado["red_interaccion_musical"] = blindar(red_interaccion, score, instrumento=instrumento, nombre="red_interaccion_musical")

    if modo == "mixtas":
        resultado["sincronizacion_entrada"] = blindar(
            sincronizacion_entrada,
            midi,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="sincronizacion_entrada"
        )
        resultado["dispersion_temporal"] = blindar(
            dispersion_temporal_por_compas,
            score,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="dispersion_temporal"
        )

    if modo == "compases":
        resultado["dispersion_temporal"] = blindar(
            dispersion_temporal_por_compas,
            score,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="dispersion_temporal"
        )
        resultado["sincronizacion_entrada_por_compas"] = blindar(
            sincronizacion_entrada_por_compas,
            score,
            midi,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="sincronizacion_entrada_por_compas"
        )
        resultado["dispersion_temporal_por_compas"] = blindar(
            dispersion_temporal_por_compas,
            score,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="dispersion_temporal_por_compas"
        )

    return resultado