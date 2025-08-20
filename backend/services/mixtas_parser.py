import pretty_midi
import numpy as np
from music21 import converter, note, chord, stream

def carga_score(midi_path):
    return converter.parse(midi_path)

def carga_midi(midi_path):
    return pretty_midi.PrettyMIDI(midi_path)

def compases(score):
    return list(score.parts[0].getElementsByClass(stream.Measure))

def notas_por_compas(score, instrumentos_seleccionados=None):
    resultado = []
    for m in compases(score):
        notas = [
            n for n in m.notes
            if isinstance(n, note.Note) and (
                not instrumentos_seleccionados or n.getInstrument().instrumentName in instrumentos_seleccionados
            )
        ]
        resultado.append(len(notas))
    return resultado

def promedio_notas_por_compas(score, instrumentos_seleccionados=None):
    cantidades = notas_por_compas(score, instrumentos_seleccionados)
    return float(round(np.mean(cantidades), 2)) if cantidades else 0.0

def varianza_notas_por_compas(score, instrumentos_seleccionados=None):
    cantidades = notas_por_compas(score, instrumentos_seleccionados)
    return float(round(np.var(cantidades), 2)) if cantidades else 0.0

def rango_dinamico_por_compas(midi, total_compases, instrumentos_seleccionados=None):
    duracion_total = midi.get_end_time()
    duracion_compas = duracion_total / total_compases
    rangos = []

    for i in range(total_compases):
        inicio = i * duracion_compas
        fin = (i + 1) * duracion_compas
        velocities = []

        for inst in midi.instruments:
            nombre = inst.name.strip() or pretty_midi.program_to_instrument_name(inst.program)
            if instrumentos_seleccionados and nombre not in instrumentos_seleccionados:
                continue
            velocities += [n.velocity for n in inst.notes if inicio <= n.start < fin]

        if velocities:
            rangos.append(int(max(velocities) - min(velocities)))
        else:
            rangos.append(0)

    return rangos

def promedio_rango_dinamico(midi, total_compases, instrumentos_seleccionados=None):
    rangos = rango_dinamico_por_compas(midi, total_compases, instrumentos_seleccionados)
    return float(round(np.mean(rangos), 2)) if rangos else 0.0

def densidad_armonica(score):
    acordes = score.chordify().recurse().getElementsByClass(chord.Chord)
    notas_totales = sum(len(c.pitches) for c in acordes)
    return float(round(notas_totales / len(acordes), 2)) if acordes else 0.0

def variabilidad_intervalica(score, instrumentos_seleccionados=None):
    notas = [
        n for n in score.flatten().notes
        if isinstance(n, note.Note) and (
            not instrumentos_seleccionados or n.getInstrument().instrumentName in instrumentos_seleccionados
        )
    ]
    intervalos = [
        notas[i+1].pitch.midi - notas[i].pitch.midi
        for i in range(len(notas) - 1)
    ]
    return float(round(np.std(intervalos), 2)) if intervalos else 0.0

def entropia_duracion(score, instrumentos_seleccionados=None):
    duraciones = [
        n.quarterLength for n in score.flatten().notes
        if isinstance(n, note.Note) and (
            not instrumentos_seleccionados or n.getInstrument().instrumentName in instrumentos_seleccionados
        )
    ]
    if not duraciones:
        return 0.0
    hist = np.histogram(duraciones, bins=8)[0]
    prob = hist / np.sum(hist)
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def sincronizacion_entrada(midi, instrumentos_seleccionados=None):
    entradas = []
    for inst in midi.instruments:
        nombre = inst.name.strip() or pretty_midi.program_to_instrument_name(inst.program)
        if instrumentos_seleccionados and nombre not in instrumentos_seleccionados:
            continue
        if inst.notes:
            entradas.append(inst.notes[0].start)
    if len(entradas) < 2:
        return 0.0
    return float(round(np.std(entradas), 3))

def dispersión_temporal(score, instrumentos_seleccionados=None):
    tiempos = [
        n.offset for n in score.flatten().notes
        if isinstance(n, note.Note) and (
            not instrumentos_seleccionados or n.getInstrument().instrumentName in instrumentos_seleccionados
        )
    ]
    return float(round(np.std(tiempos), 3)) if tiempos else 0.0

def compacidad_melodica(score, instrumentos_seleccionados=None):
    notas = [
        n.pitch.midi for n in score.flatten().notes
        if isinstance(n, note.Note) and (
            not instrumentos_seleccionados or n.getInstrument().instrumentName in instrumentos_seleccionados
        )
    ]
    if not notas:
        return 0.0
    return float(round(np.std(notas), 2))

def repetitividad_motívica(score, n=3, instrumentos_seleccionados=None):
    notas = [
        n.pitch.midi for n in score.flatten().notes
        if isinstance(n, note.Note) and (
            not instrumentos_seleccionados or n.getInstrument().instrumentName in instrumentos_seleccionados
        )
    ]
    motivos = {}
    for i in range(len(notas) - n + 1):
        motivo = tuple(notas[i:i+n])
        clave = "-".join(str(p) for p in motivo)
        motivos[clave] = motivos.get(clave, 0) + 1
    repetidos = [v for v in motivos.values() if v > 1]
    return float(round(np.mean(repetidos), 2)) if repetidos else 0.0

def entropia_melodica(score, instrumentos_seleccionados=None):
    notas = [
        n.pitch.midi for n in score.flatten().notes
        if isinstance(n, note.Note) and (
            not instrumentos_seleccionados or n.getInstrument().instrumentName in instrumentos_seleccionados
        )
    ]
    if not notas:
        return 0.0
    hist = np.histogram(notas, bins=12)[0]
    prob = hist / np.sum(hist)
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def entropia_ritmica(score, instrumentos_seleccionados=None):
    duraciones = [
        n.quarterLength for n in score.flatten().notes
        if isinstance(n, note.Note) and (
            not instrumentos_seleccionados or n.getInstrument().instrumentName in instrumentos_seleccionados
        )
    ]
    if not duraciones:
        return 0.0
    hist = np.histogram(duraciones, bins=8)[0]
    prob = hist / np.sum(hist)
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def entropia_armonica(score, instrumentos_seleccionados=None):
    acordes = score.chordify().recurse().getElementsByClass(chord.Chord)
    if instrumentos_seleccionados:
        acordes = [
            c for c in acordes
            if any(
                p.instrumentName in instrumentos_seleccionados
                for p in c.getContextByClass(stream.Part).getElementsByClass(note.Note)
                if hasattr(p, 'instrumentName')
            )
        ]
    nombres = [c.pitchedCommonName for c in acordes]
    if not nombres:
        return 0.0
    hist = np.histogram(range(len(nombres)), bins=8)[0]
    prob = hist / np.sum(hist)
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def analizar_mixtas(midi_path, instrumentos_seleccionados=None):
    score = carga_score(midi_path)
    midi = carga_midi(midi_path)
    total_compases = len(compases(score))

    return {
        "promedio_notas_por_compas": promedio_notas_por_compas(score, instrumentos_seleccionados),
        "varianza_notas_por_compas": varianza_notas_por_compas(score, instrumentos_seleccionados),
        "promedio_rango_dinamico": promedio_rango_dinamico(midi, total_compases, instrumentos_seleccionados),
        "densidad_armonica": densidad_armonica(score),
        "variabilidad_intervalica": variabilidad_intervalica(score, instrumentos_seleccionados),
        "entropia_duracion": entropia_duracion(score, instrumentos_seleccionados),
        "sincronizacion_entrada": sincronizacion_entrada(midi, instrumentos_seleccionados),
        "dispersión_temporal": dispersión_temporal(score, instrumentos_seleccionados),
        "compacidad_melodica": compacidad_melodica(score, instrumentos_seleccionados),
        "repetitividad_motívica": repetitividad_motívica(score, n=3, instrumentos_seleccionados=instrumentos_seleccionados),
        "entropia_melodica": entropia_melodica(score, instrumentos_seleccionados),
        "entropia_ritmica": entropia_ritmica(score, instrumentos_seleccionados),
        "entropia_armonica": entropia_armonica(score, instrumentos_seleccionados),
        "entropia_compuesta": float(round(
            np.mean([
                entropia_melodica(score, instrumentos_seleccionados),
                entropia_ritmica(score, instrumentos_seleccionados),
                entropia_armonica(score, instrumentos_seleccionados)
            ]), 3))
    }