from music21 import converter, stream, note, chord, pitch
import numpy as np
import pretty_midi
from collections import defaultdict
import os

# -------------------------------
# Funciones auxiliares
# -------------------------------

def calcular_ambitus(m):
    notas = [n for n in m.notes if isinstance(n, note.Note)]
    if not notas:
        return {"min": None, "max": None}
    alturas = [n.pitch for n in notas]
    return {
        "min": min(alturas).nameWithOctave,
        "max": max(alturas).nameWithOctave
    }

def complejidad_ritmica(m):
    duraciones = [n.quarterLength for n in m.notes if isinstance(n, note.Note)]
    if not duraciones:
        return 0.0
    hist = np.histogram(duraciones, bins=8)[0]
    prob = hist / np.sum(hist)
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def complejidad_ritmica_cuantificable(m):
    duraciones = [n.quarterLength for n in m.notes if isinstance(n, note.Note)]
    duraciones_estandar = {0.25, 0.5, 1.0, 2.0, 4.0}
    complejas = [d for d in duraciones if round(d, 3) not in duraciones_estandar]
    return len(complejas)

def direccionalidad_melodica(m):
    notas = [n.pitch.midi for n in m.notes if isinstance(n, note.Note)]
    if len(notas) < 2:
        return 0.0
    cambios = [np.sign(notas[i+1] - notas[i]) for i in range(len(notas)-1)]
    return float(round(np.mean(cambios), 3))

def regularidad_metrica(compases):
    cantidades = [len([n for n in m.notes if isinstance(n, note.Note)]) for m in compases]
    return float(round(np.std(cantidades), 3)) if cantidades else 0.0

def detectar_polirritmia(m):
    duraciones = [n.quarterLength for n in m.notes if isinstance(n, note.Note)]
    subdivs = set(int(1 / d) if d < 1 else int(d) for d in duraciones if d > 0)
    if len(subdivs) >= 2:
        mcm = int(np.lcm.reduce(list(subdivs)))
        return {"subdivisiones": sorted([int(s) for s in subdivs]), "mcm": mcm}
    return {"subdivisiones": sorted([int(s) for s in subdivs]), "mcm": None}

def tipo_textura_por_compas(m):
    voces = set(n.partId for n in m.notes if hasattr(n, 'partId'))
    if len(voces) == 1:
        return "monofónica"
    elif len(voces) == 2:
        return "homofónica"
    elif len(voces) > 2:
        return "polifónica"
    else:
        return "vacío"

def balance_dinamico_por_compas(m):
    velocities = [n.volume.velocity for n in m.notes if hasattr(n, 'volume') and hasattr(n.volume, 'velocity')]
    return float(round(np.std(velocities), 2)) if velocities else 0.0

def solismo_vs_tutti_por_compas(m):
    conteo = defaultdict(int)
    for n in m.notes:
        if isinstance(n, note.Note) and hasattr(n, 'partId'):
            conteo[n.partId] += 1
    total = sum(conteo.values())
    if not conteo:
        return "vacío"
    dominante = max(conteo.values())
    return "solismo" if dominante > 0.6 * total else "tutti"

def simultaneidad_tematica_por_compas(m, n=3):
    motivos_por_instrumento = defaultdict(list)
    for nte in m.notes:
        if isinstance(nte, note.Note) and hasattr(nte, 'partId'):
            motivos_por_instrumento[nte.partId].append(nte.pitch.midi)
    motivos = defaultdict(set)
    for nombre, notas in motivos_por_instrumento.items():
        for i in range(len(notas) - n + 1):
            motivo = tuple(notas[i:i+n])
            motivos[motivo].add(nombre)
    simultaneos = [m for m, voces in motivos.items() if len(voces) > 1]
    return len(simultaneos)

def contrapunto_activo_por_compas(m):
    voces = defaultdict(list)
    for n in m.notes:
        if isinstance(n, note.Note) and hasattr(n, 'partId'):
            voces[n.partId].append(n.pitch.midi)
    direcciones = {}
    for nombre, notas in voces.items():
        if len(notas) < 2:
            continue
        cambios = [np.sign(notas[i+1] - notas[i]) for i in range(len(notas)-1)]
        direcciones[nombre] = cambios
    contrapuntos = 0
    nombres = list(direcciones.keys())
    for i in range(len(nombres)):
        for j in range(i+1, len(nombres)):
            d1 = direcciones[nombres[i]]
            d2 = direcciones[nombres[j]]
            if d1 and d2 and np.mean(d1) * np.mean(d2) < 0:
                contrapuntos += 1
    return contrapuntos

# -------------------------------
# Función principal
# -------------------------------

def analizar_compases(nombre_archivo: str, instrumentos_seleccionados=None):
    ruta = os.path.join("uploads", nombre_archivo)
    score = converter.parse(ruta)
    midi = pretty_midi.PrettyMIDI(ruta)

    # Filtrado por instrumento (sin modificar score.parts directamente)
    if instrumentos_seleccionados:
        midi.instruments = [
            inst for inst in midi.instruments
            if inst.name.strip() in instrumentos_seleccionados
        ]
        partes_filtradas = [
            p for p in score.parts
            if p.partName in instrumentos_seleccionados
        ]
        score_filtrado = stream.Score()
        for parte in partes_filtradas:
            score_filtrado.append(parte)
    else:
        score_filtrado = score

    compases = score_filtrado.parts[0].getElementsByClass(stream.Measure)
    resultado = []

    for m in compases:
        datos = {
            "numero": int(m.number),
            "duracion": float(m.duration.quarterLength),
            "notas": int(len([n for n in m.notes if isinstance(n, note.Note)])),
            "ambitus": calcular_ambitus(m),
            "complejidad_ritmica": complejidad_ritmica(m),
            "complejidad_ritmica_cuantificable": complejidad_ritmica_cuantificable(m),
            "direccionalidad_melodica": direccionalidad_melodica(m),
            "polirritmia": detectar_polirritmia(m),
            "tipo_textura": tipo_textura_por_compas(m),
            "balance_dinamico": balance_dinamico_por_compas(m),
            "solismo_vs_tutti": solismo_vs_tutti_por_compas(m),
            "simultaneidad_tematica": simultaneidad_tematica_por_compas(m),
            "contrapunto_activo": contrapunto_activo_por_compas(m)
        }
        resultado.append(datos)

    resultado.append({
        "global": {
            "regularidad_metrica": regularidad_metrica(compases)
        }
    })

    return resultado