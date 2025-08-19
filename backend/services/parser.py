import os
import pretty_midi
import numpy as np
from music21 import converter, note, chord
from music21 import stream

def analizar_midi(nombre_archivo: str, instrumentos_seleccionados=None) -> dict:
    ruta = os.path.join("uploads", nombre_archivo)

    try:
        midi = pretty_midi.PrettyMIDI(ruta)
        score = converter.parse(ruta)

        if instrumentos_seleccionados:
            midi.instruments = [
                inst for inst in midi.instruments
                if inst.name.strip() in instrumentos_seleccionados
            ]
            score.parts = [
                p for p in score.parts
                if p.partName in instrumentos_seleccionados
            ]

        duracion = round(midi.get_end_time(), 2)
        tempo = round(midi.estimate_tempo(), 2)
        instrumentos = [inst.name or "Instrumento desconocido" for inst in midi.instruments]
        compases_aprox = int(duracion / (60 / tempo) / 4)

        instrumento = instrumentos_seleccionados[0] if instrumentos_seleccionados else None

        return {
            "archivo": nombre_archivo,
            "duracion_segundos": duracion,
            "tempo_promedio": tempo,
            "instrumentos_detectados": instrumentos,
            "compases_estimados": compases_aprox,
            "motivos_recurrentes": motivos_recurrentes(score, instrumento=instrumento),
            "progresiones_armonicas": progresiones_armonicas(score, instrumento=instrumento),
            "intervalos_predominantes": intervalos_predominantes(score, instrumento=instrumento),
            "balance_dinamico": balance_dinamico(midi, instrumento=instrumento),
            "familias_instrumentales": clasificar_familias(midi),
            "contrapunto_activo": contrapunto_activo(score, instrumento=instrumento),
            "red_interaccion_musical": red_interaccion(score, instrumento=instrumento)
        }

    except Exception as e:
        return {"error": f"No se pudo analizar el archivo: {str(e)}"}

# -------------------------------
# Funciones auxiliares con filtro
# -------------------------------

def motivos_recurrentes(score, n=3, instrumento=None):
    motivos = {}
    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]

    for p in partes:
        compases = p.getElementsByClass('Measure')
        for m in compases:
            notas = [n.pitch.midi for n in m.notes if isinstance(n, note.Note)]
            for i in range(len(notas) - n + 1):
                motivo = tuple(notas[i:i+n])
                clave = "-".join(str(p) for p in motivo)
                motivos[clave] = motivos.get(clave, 0) + 1
    return {k: int(v) for k, v in motivos.items() if v > 1}

def progresiones_armonicas(score, instrumento=None):
    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]
    acordes = stream.Score(parts=partes).chordify().recurse().getElementsByClass(chord.Chord)
    return [c.pitchedCommonName for c in acordes]

def intervalos_predominantes(score, instrumento=None):
    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]
    notas = [n for p in partes for n in p.flat.notes if isinstance(n, note.Note)]
    intervalos = [
        notas[i].pitch.midi - notas[i-1].pitch.midi
        for i in range(1, len(notas))
    ]
    return intervalos

def balance_dinamico(midi, instrumento=None):
    energia = {}
    for inst in midi.instruments:
        nombre = inst.name.strip() or pretty_midi.program_to_instrument_name(inst.program)
        if instrumento and nombre != instrumento:
            continue
        energia[nombre] = float(
            round(np.mean([n.velocity for n in inst.notes]), 2)
        ) if inst.notes else 0.0
    return energia

def clasificar_familias(midi):
    familias = {
        "Cuerdas": [], "Vientos madera": [], "Metales": [],
        "Percusión": [], "Teclado": [], "Otros": []
    }
    for inst in midi.instruments:
        nombre = pretty_midi.program_to_instrument_name(inst.program)
        if inst.program in range(0, 8):
            familias["Cuerdas"].append(nombre)
        elif inst.program in range(64, 72):
            familias["Metales"].append(nombre)
        elif inst.program in range(72, 80):
            familias["Vientos madera"].append(nombre)
        elif inst.is_drum:
            familias["Percusión"].append(nombre)
        elif inst.program in range(16, 24):
            familias["Teclado"].append(nombre)
        else:
            familias["Otros"].append(nombre)
    return familias

def contrapunto_activo(score, instrumento=None):
    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]
    if len(partes) < 2:
        return 0.0
    entropias = []
    for p in partes:
        notas = [n.pitch.midi for n in p.flat.notes if isinstance(n, note.Note)]
        if notas:
            hist = np.histogram(notas, bins=12)[0]
            prob = hist / np.sum(hist)
            entropia = -np.sum(prob * np.log2(prob + 1e-9))
            entropias.append(entropia)
    if len(entropias) < 2:
        return 0.0
    return float(round(np.std(entropias), 3))

def red_interaccion(score, instrumento=None):
    from collections import defaultdict
    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]

    nodos = defaultdict(set)
    for p in partes:
        nombre = p.partName or "Parte"
        for n in p.flat.notes:
            tiempo = round(n.offset, 2)
            nodos[tiempo].add(nombre)

    conexiones = defaultdict(int)
    for tiempo, partes in nodos.items():
        partes = list(partes)
        for i in range(len(partes)):
            for j in range(i + 1, len(partes)):
                par = tuple(sorted([partes[i], partes[j]]))
                conexiones[par] += 1
    return {f"{a}-{b}": int(v) for (a, b), v in conexiones.items()}