from backend.services.parser import (
    instrumentos_detectados, cantidad_total_notas, partes_detectadas,
    participacion_por_partes, clasificar_familias, balance_dinamico,
    motivos_recurrentes, intervalos_predominantes, progresiones_armonicas,
    entropia_melodica, entropia_ritmica, entropia_armonica, entropia_interaccion,
    complejidad_total, firma_metrica, seccion_aurea, variedad_tonal,
    innovacion_estadistica, firma_fractal, contrapunto_activo, red_interaccion,
    seccion_aurea_por_compas, compases_no_vacios_por_instrumento
)
from backend.services.mixtas_parser import (
    compacidad_melodica, repetitividad_motívica, densidad_armonica,
    variabilidad_intervalica, promedio_notas_por_compas, varianza_notas_por_compas,
    promedio_rango_dinamico, sincronizacion_entrada, compacidad_melodica_por_compas, repetitividad_motívica_por_compas,
    notas_por_compas, entropia_armonica_por_compas,
    densidad_armonica_por_compas, sincronizacion_entrada_por_compas,
    dispersion_temporal_por_compas, promedio_rango_dinamico_por_compas,
    variabilidad_intervalica_por_compas, contrapunto_activo_instrumento
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
        resultado["compases_no_vacios_por_instrumento"] = blindar(compases_no_vacios_por_instrumento, score, nombre="compases_no_vacios_por_instrumento") # Añadido
    return resultado

def metricas_melodicas(score, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, None, instrumento, metricas_melodicas)
    resultado = {}
    if modo == "global":
        resultado["entropia_melodica"] = blindar(entropia_melodica, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="entropia_melodica") # Modificado
        resultado["intervalos_predominantes"] = blindar(intervalos_predominantes, score, instrumento=instrumento, nombre="intervalos_predominantes")
        resultado["motivos_recurrentes"] = blindar(motivos_recurrentes, score, instrumento=instrumento, nombre="motivos_recurrentes")
        resultado["variedad_tonal"] = blindar(variedad_tonal, score, nombre="variedad_tonal")
    if modo == "mixtas":
        resultado["compacidad_melodica"] = blindar(compacidad_melodica, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="compacidad_melodica") # Modificado
        resultado["repetitividad_motívica"] = blindar(repetitividad_motívica, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="repetitividad_motívica")
    if modo == "compases":
        resultado["promedio_notas_por_compas"] = blindar(promedio_notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="promedio_notas_por_compas") # Modificado
        resultado["varianza_notas_por_compas"] = blindar(varianza_notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="varianza_notas_por_compas") # Modificado
        resultado["compacidad_melodica_por_compas"] = blindar(compacidad_melodica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="compacidad_melodica_por_compas")
        resultado["repetitividad_motívica_por_compas"] = blindar(repetitividad_motívica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="repetitividad_motívica_por_compas")
        resultado["cantidad_notas_por_compas"] = blindar(notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="cantidad_notas_por_compas")
    return resultado

def metricas_ritmicas(score, instrumento=None, modo="global"):
    resultado = {}
    if modo == "todos":
        for submodo in ["global", "mixtas", "compases"]:
            try:
                resultado.update(metricas_ritmicas(score, instrumento=instrumento, modo=submodo))
            except Exception as e:
                resultado[f"[ERROR en {submodo}]"] = str(e)
        return resultado
    if modo == "global":
        resultado["entropia_ritmica"] = blindar(entropia_ritmica, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="entropia_ritmica")
        resultado["firma_metrica"] = blindar(firma_metrica, score, nombre="firma_metrica")
    if modo == "mixtas":
        resultado["entropia_ritmica"] = blindar(entropia_ritmica, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="entropia_ritmica")
        resultado["firma_metrica"] = blindar(firma_metrica, score, nombre="firma_metrica")
        resultado["promedio_notas_por_compas"] = blindar(promedio_notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="promedio_notas_por_compas")
        resultado["varianza_notas_por_compas"] = blindar(varianza_notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="varianza_notas_por_compas")
    if modo == "compases":
        resultado["promedio_notas_por_compas"] = blindar(promedio_notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="promedio_notas_por_compas")
        resultado["varianza_notas_por_compas"] = blindar(varianza_notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="varianza_notas_por_compas")
        resultado["cantidad_notas_por_compas"] = blindar(notas_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="cantidad_notas_por_compas")
    return resultado

def metricas_armonicas(score, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, None, instrumento, metricas_armonicas)
    resultado = {}
    if modo == "global":
        resultado["entropia_armonica"] = blindar(entropia_armonica, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="entropia_armonica") # Modificado
        resultado["progresiones_armonicas"] = blindar(progresiones_armonicas, score, instrumento=instrumento, nombre="progresiones_armonicas")
    if modo == "mixtas":
        resultado["densidad_armonica"] = blindar(densidad_armonica, score, nombre="densidad_armonica")
        resultado["innovacion_estadistica"] = blindar(innovacion_estadistica, score, nombre="innovacion_estadistica")
    if modo == "compases":
        resultado["densidad_armonica"] = blindar(densidad_armonica, score, nombre="densidad_armonica")
        resultado["densidad_armonica_por_compas"] = blindar(densidad_armonica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="densidad_armonica_por_compas")
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
    return resultado

def metricas_texturales(score, instrumento=None, modo="global"):
    if modo == "todos":
        return fusionar_metricas(score, None, instrumento, metricas_texturales)
    resultado = {}
    if modo == "global":
        resultado["contrapunto_activo"] = blindar(contrapunto_activo, score, instrumento=instrumento, nombre="contrapunto_activo")
        resultado["firma_fractal"] = blindar(firma_fractal, score, instrumento=instrumento, nombre="firma_fractal") # Modificado
    if modo == "mixtas":
        resultado["complejidad_total"] = blindar(complejidad_total, score, instrumento=instrumento, nombre="complejidad_total") # Modificado
    if modo == "compases":
        resultado["complejidad_total"] = blindar(complejidad_total, score, instrumento=instrumento, nombre="complejidad_total") # Modificado
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
        resultado["compases_estimados"] = blindar(lambda s: int(s.highestTime / (60 / 120) / 4), score, nombre="compases_estimados") # Mantener si se quiere la estimación global
    if modo == "compases":
        resultado["compases_estimados"] = blindar(lambda s: int(s.highestTime / (60 / 120) / 4), score, nombre="compases_estimados") # Mantener si se quiere la estimación global
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
        resultado["entropia_interaccion"] = blindar(entropia_interaccion, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="entropia_interaccion") # Modificado
        resultado["red_interaccion_musical"] = blindar(red_interaccion, score, instrumento=instrumento, nombre="red_interaccion_musical")
    if modo == "mixtas":
        resultado["sincronizacion_entrada"] = blindar(
            sincronizacion_entrada,
            midi,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="sincronizacion_entrada"
        )
        resultado["dispersion_temporal_por_compas"] = blindar(
            dispersion_temporal_por_compas,
            score,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="dispersion_temporal_por_compas"
        )
    if modo == "compases":
        resultado["dispersion_temporal_por_compas"] = blindar(
            dispersion_temporal_por_compas,
            score,
            instrumentos_seleccionados=[instrumento] if instrumento else None,
            nombre="dispersion_temporal_por_compas"
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
        resultado["variabilidad_intervalica"] = blindar(variabilidad_intervalica,score, [instrumento] if instrumento else None, nombre="variabilidad_intervalica")
        resultado["variabilidad_intervalica_por_compas"] = blindar(variabilidad_intervalica_por_compas, score, instrumentos_seleccionados=[instrumento] if instrumento else None, nombre="variabilidad_intervalica_por_compas")
    return resultado

def metricas_todas(score, midi, instrumento=None, modo="global"):
    resultado = {}
    submodos_a_ejecutar = ["global", "mixtas", "compases"] if modo == "todos" else [modo]
    for submodo_actual in submodos_a_ejecutar:
        resultado.update(blindar(metricas_instrumentales, score, midi, instrumento=instrumento, modo=submodo_actual, nombre=f"instrumentales_{submodo_actual}"))
        resultado.update(blindar(metricas_melodicas, score, instrumento=instrumento, modo=submodo_actual, nombre=f"melodicas_{submodo_actual}"))
        resultado.update(blindar(metricas_ritmicas, score, instrumento=instrumento, modo=submodo_actual, nombre=f"ritmicas_{submodo_actual}"))
        resultado.update(blindar(metricas_armonicas, score, instrumento=instrumento, modo=submodo_actual, nombre=f"armonicas_{submodo_actual}"))
        resultado.update(blindar(metricas_formales, score, modo=submodo_actual, nombre=f"formales_{submodo_actual}"))
        resultado.update(blindar(metricas_texturales, score, instrumento=instrumento, modo=submodo_actual, nombre=f"texturales_{submodo_actual}"))
        resultado.update(blindar(metricas_interaccion, score, midi, instrumento=instrumento, modo=submodo_actual, nombre=f"interaccion_{submodo_actual}"))
        resultado.update(blindar(metricas_comparativas, score, midi, instrumento=instrumento, modo=submodo_actual, nombre=f"comparativas_{submodo_actual}"))
        resultado.update(blindar(metricas_diferenciadoras, score, instrumento=instrumento, modo=submodo_actual, nombre=f"diferenciadoras_{submodo_actual}"))
    return resultado