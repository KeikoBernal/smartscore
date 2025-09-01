import pretty_midi
import numpy as np
from music21 import converter, note, chord, stream

def carga_score(midi_path):
    return converter.parse(midi_path)

def carga_midi(midi_path):
    return pretty_midi.PrettyMIDI(midi_path)

def compases(score):
    if not score.parts:
        return []
    return list(score.parts[0].getElementsByClass(stream.Measure))

def notas_por_compas(score, instrumentos_seleccionados=None):
    resultados_por_compas = []
    for i, m in enumerate(compases(score)):
        notas = []
        for p in score.parts:
            if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
                continue
            compas_parte = p.measure(m.number)
            if compas_parte:
                notas.extend([n for n in compas_parte.notes if isinstance(n, note.Note)])
        resultados_por_compas.append({f"compas #{i+1}": len(notas)})
    return resultados_por_compas

def promedio_notas_por_compas(score, instrumentos_seleccionados=None):
    cantidades_raw = [list(d.values())[0] for d in notas_por_compas(score, instrumentos_seleccionados)]
    return float(round(np.mean(cantidades_raw), 2)) if cantidades_raw else 0.0

def varianza_notas_por_compas(score, instrumentos_seleccionados=None):
    resultados_por_compas = []
    for i, m in enumerate(compases(score)):
        notas_midi_en_compas = []
        for p in score.parts:
            if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
                continue
            compas_parte = p.measure(m.number)
            if compas_parte:
                notas_midi_en_compas.extend([n.pitch.midi for n in compas_parte.notes if isinstance(n, note.Note)])
        if len(notas_midi_en_compas) > 1:
            varianza = float(round(np.var(notas_midi_en_compas), 2))
        else:
            varianza = 0.0
        resultados_por_compas.append({f"compas #{i+1}": varianza})
    return resultados_por_compas

def entropia_duracion_por_compas(score, instrumentos_seleccionados=None):
    resultados_por_compas = []
    for i, m in enumerate(compases(score)):
        duraciones_en_compas = []
        for p in score.parts:
            if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
                continue
            compas_parte = p.measure(m.number)
            if compas_parte:
                duraciones_en_compas.extend([n.quarterLength for n in compas_parte.notes if isinstance(n, note.Note)])
        if not duraciones_en_compas:
            entropia = 0.0
        else:
            hist, _ = np.histogram(duraciones_en_compas, bins=8)
            if np.sum(hist) == 0:
                entropia = 0.0
            else:
                prob = hist / np.sum(hist)
                prob = prob[prob > 0]
                entropia = -np.sum(prob * np.log2(prob))
        resultados_por_compas.append({f"compas #{i+1}": float(round(entropia, 3))})
    return resultados_por_compas

def compacidad_melodica(score, instrumentos_seleccionados=None):
    alturas = []
    for p in score.parts:
        if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
            continue
        alturas.extend([n.pitch.midi for n in p.flat.notes if isinstance(n, note.Note)])
    if not alturas:
        return 0.0
    rango = max(alturas) - min(alturas) if alturas else 0
    return float(round(len(set(alturas)) / (rango + 1), 3))

def compacidad_melodica_por_compas(score, instrumentos_seleccionados=None):
    resultados = []
    for i, m in enumerate(compases(score)):
        alturas = []
        for p in score.parts:
            if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
                continue
            compas_parte = p.measure(m.number)
            if compas_parte:
                alturas.extend([n.pitch.midi for n in compas_parte.notes if isinstance(n, note.Note)])
        if not alturas:
            valor = 0.0
        else:
            rango = max(alturas) - min(alturas) if alturas else 0
            valor = float(round(len(set(alturas)) / (rango + 1), 3))
        resultados.append({f"compas #{i+1}": valor})
    return resultados

def repetitividad_motívica(score, n=3, instrumentos_seleccionados=None):
    motivos_conteo = {}
    partes = score.parts
    if instrumentos_seleccionados:
        partes = [p for p in partes if p.partName in instrumentos_seleccionados]

    for p in partes:
        notas = [n.pitch.midi for n in p.flat.notes if isinstance(n, note.Note)]
        for i in range(len(notas) - n + 1):
            motivo = tuple(notas[i:i+n])
            motivos_conteo[motivo] = motivos_conteo.get(motivo, 0) + 1

    total_motivos = sum(motivos_conteo.values())
    if total_motivos == 0:
        return 0.0
    repetidos = sum(count for count in motivos_conteo.values() if count > 1)
    return float(round(repetidos / total_motivos, 3))

def repetitividad_motívica_por_compas(score, n=3, instrumentos_seleccionados=None):
    resultados = []
    for i, m in enumerate(compases(score)):
        motivos_conteo = {}
        partes = score.parts
        if instrumentos_seleccionados:
            partes = [p for p in partes if p.partName in instrumentos_seleccionados]
        for p in partes:
            compas_parte = p.measure(m.number)
            if not compas_parte:
                continue
            notas = [n.pitch.midi for n in compas_parte.notes if isinstance(n, note.Note)]
            for j in range(len(notas) - n + 1):
                motivo = tuple(notas[j:j+n])
                motivos_conteo[motivo] = motivos_conteo.get(motivo, 0) + 1
        total_motivos = sum(motivos_conteo.values())
        if total_motivos == 0:
            valor = 0.0
        else:
            repetidos = sum(count for count in motivos_conteo.values() if count > 1)
            valor = float(round(repetidos / total_motivos, 3))
        resultados.append({f"compas #{i+1}": valor})
    return resultados

def entropia_melodica(score, instrumentos_seleccionados=None):
    alturas = []
    for p in score.parts:
        if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
            continue
        alturas.extend([n.pitch.midi for n in p.flat.notes if isinstance(n, note.Note)])
    if not alturas:
        return 0.0
    hist = np.histogram(alturas, bins=24)[0]
    prob = hist / np.sum(hist)
    prob = prob[prob > 0]
    entropia = -np.sum(prob * np.log2(prob))
    return float(round(entropia, 3))

def entropia_ritmica(score, instrumentos_seleccionados=None):
    duraciones = []
    for p in score.parts:
        if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
            continue
        duraciones.extend([n.quarterLength for n in p.flat.notes if isinstance(n, note.Note)])
    if not duraciones:
        return 0.0
    hist = np.histogram(duraciones, bins=16)[0]
    prob = hist / np.sum(hist)
    prob = prob[prob > 0]
    entropia = -np.sum(prob * np.log2(prob))
    return float(round(entropia, 3))

def entropia_armonica(score, instrumentos_seleccionados=None):
    partes = score.parts
    if instrumentos_seleccionados:
        partes = [p for p in partes if p.partName in instrumentos_seleccionados]
    if not partes:
        return 0.0
    score_chord = stream.Score()
    for p in partes:
        score_chord.append(p)
    acordes = score_chord.chordify().recurse().getElementsByClass(chord.Chord)
    nombres_acordes = [c.pitchedCommonName for c in acordes if c.pitchedCommonName]
    if not nombres_acordes:
        return 0.0
    letras = [ord(a[0]) for a in nombres_acordes if a]
    hist = np.histogram(letras, bins=12)[0]
    prob = hist / np.sum(hist)
    prob = prob[prob > 0]
    entropia = -np.sum(prob * np.log2(prob))
    return float(round(entropia, 3))

def densidad_armonica(score):
    compases_list = compases(score) # Renombrado para evitar conflicto con la función compases
    if not compases_list:
        return 0.0
    score_chord = score.chordify()
    acordes = score_chord.recurse().getElementsByClass(chord.Chord)
    total_acordes = len(acordes)
    densidad = total_acordes / len(compases_list)
    return float(round(densidad, 3))

def densidad_armonica_por_compas(score, instrumentos_seleccionados=None):
    resultados = []
    compases_lista = compases(score)
    for i, m in enumerate(compases_lista):
        score_chord = stream.Score()
        for p in score.parts:
            if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
                continue
            compas_parte = p.measure(m.number)
            if compas_parte:
                score_chord.append(compas_parte)
        acordes = score_chord.chordify().recurse().getElementsByClass(chord.Chord)
        densidad = len(acordes)
        resultados.append({f"compas #{i+1}": densidad})
    return resultados

def entropia_armonica_por_compas(score, instrumentos_seleccionados=None):
    resultados = []
    compases_lista = compases(score)
    for i, m in enumerate(compases_lista):
        partes = score.parts
        if instrumentos_seleccionados:
            partes = [p for p in partes if p.partName in instrumentos_seleccionados]
        score_chord = stream.Score()
        for p in partes:
            compas_parte = p.measure(m.number)
            if compas_parte:
                score_chord.append(compas_parte)
        acordes = score_chord.chordify().recurse().getElementsByClass(chord.Chord)
        nombres_acordes = [c.pitchedCommonName for c in acordes if c.pitchedCommonName]
        if not nombres_acordes:
            entropia = 0.0
        else:
            letras = [ord(a[0]) for a in nombres_acordes if a]
            hist = np.histogram(letras, bins=12)[0]
            prob = hist / np.sum(hist) if np.sum(hist) > 0 else np.zeros_like(hist)
            prob = prob[prob > 0]
            entropia = -np.sum(prob * np.log2(prob)) if prob.size > 0 else 0.0
        resultados.append({f"compas #{i+1}": float(round(entropia, 3))})
    return resultados

def sincronizacion_entrada(midi, instrumentos_seleccionados=None):
    tiempos = []
    for inst in midi.instruments:
        nombre = inst.name.strip() or pretty_midi.program_to_instrument_name(inst.program)
        if instrumentos_seleccionados and nombre not in instrumentos_seleccionados:
            continue
        if inst.notes:
            tiempos.append(inst.notes[0].start)
    if not tiempos:
        return 0.0
    return float(round(np.std(tiempos), 3))

def sincronizacion_entrada_por_compas(score, midi, instrumentos_seleccionados=None):
    resultados = []
    compases_lista = compases(score)
    for i, m in enumerate(compases_lista):
        tiempos = []
        for inst in midi.instruments:
            nombre = inst.name.strip() or pretty_midi.program_to_instrument_name(inst.program)
            if instrumentos_seleccionados and nombre not in instrumentos_seleccionados:
                continue
            notas_en_compas = [n for n in inst.notes if m.offset <= n.start < m.offset + m.duration.quarterLength]
            if notas_en_compas:
                tiempos.append(notas_en_compas[0].start)
        if not tiempos:
            valor = 0.0
        else:
            valor = float(round(np.std(tiempos), 3))
        resultados.append({f"compas #{i+1}": valor})
    return resultados

def dispersion_temporal(score, instrumentos_seleccionados=None):
    tiempos = []
    for p in score.parts:
        if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
            continue
        tiempos.extend([n.offset for n in p.flat.notes if isinstance(n, note.Note)])
    if not tiempos:
        return 0.0
    return float(round(np.std(tiempos), 3))

def dispersion_temporal_por_compas(score, instrumentos_seleccionados=None):
    resultados = []
    compases_lista = compases(score)
    for m in compases_lista:
        tiempos = []
        for p in score.parts:
            if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
                continue
            compas_parte = p.measure(m.number)
            if compas_parte:
                tiempos.extend([n.offset for n in compas_parte.notes if isinstance(n, note.Note)])
        if not tiempos:
            valor = 0.0
        else:
            valor = float(round(np.std(tiempos), 3))
        resultados.append({f"compas #{m.number}": valor})
    return resultados

def promedio_rango_dinamico(midi, total_compases, instrumentos_seleccionados=None):
    if total_compases == 0:
        return 0.0
    rangos = []
    for inst in midi.instruments:
        nombre = inst.name.strip() or pretty_midi.program_to_instrument_name(inst.program)
        if instrumentos_seleccionados and nombre not in instrumentos_seleccionados:
            continue
        if inst.notes:
            velocities = [n.velocity for n in inst.notes]
            rango = max(velocities) - min(velocities)
            rangos.append(rango)
    if not rangos:
        return 0.0
    return float(round(np.mean(rangos), 3))

def promedio_rango_dinamico_por_compas(midi, score, instrumentos_seleccionados=None):
    resultados = []
    compases_lista = compases(score)
    for m in compases_lista:
        rangos = []
        for inst in midi.instruments:
            nombre = inst.name.strip() or pretty_midi.program_to_instrument_name(inst.program)
            if instrumentos_seleccionados and nombre not in instrumentos_seleccionados:
                continue
            notas_en_compas = [n for n in inst.notes if m.offset <= n.start < m.offset + m.duration.quarterLength]
            if notas_en_compas:
                velocities = [n.velocity for n in notas_en_compas]
                rango = max(velocities) - min(velocities)
                rangos.append(rango)
        if not rangos:
            valor = 0.0
        else:
            valor = float(round(np.mean(rangos), 3))
        resultados.append({f"compas #{m.number}": valor})
    return resultados

def variabilidad_intervalica(score, instrumentos_seleccionados=None):
    intervalos = []
    for p in score.parts:
        if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
            continue
        notas = [n.pitch.midi for n in p.flat.notes if isinstance(n, note.Note)]
        intervalos.extend([abs(notas[i+1] - notas[i]) for i in range(len(notas)-1)])
    if not intervalos:
        return 0.0
    return float(round(np.std(intervalos), 3))

def variabilidad_intervalica_por_compas(score, instrumentos_seleccionados=None):
    resultados = []
    compases_lista = compases(score)
    for m in compases_lista:
        intervalos = []
        for p in score.parts:
            if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
                continue
            compas_parte = p.measure(m.number)
            if compas_parte:
                notas = [n.pitch.midi for n in compas_parte.notes if isinstance(n, note.Note)]
                intervalos.extend([abs(notas[i+1] - notas[i]) for i in range(len(notas)-1)])
        if not intervalos:
            valor = 0.0
        else:
            valor = float(round(np.std(intervalos), 3))
        resultados.append({f"compas #{m.number}": valor})
    return resultados

def analizar_compases(midi_path, instrumentos_seleccionados=None):
    score = carga_score(midi_path)
    midi = carga_midi(midi_path)
    total_compases = len(compases(score))

    return {
        "promedio_notas_por_compas": promedio_notas_por_compas(score, instrumentos_seleccionados),
        "varianza_notas_por_compas": varianza_notas_por_compas(score, instrumentos_seleccionados),
        "promedio_rango_dinamico": promedio_rango_dinamico(midi, total_compases, instrumentos_seleccionados),
        "densidad_armonica": densidad_armonica(score),
        "variabilidad_intervalica": variabilidad_intervalica(score, instrumentos_seleccionados),
        "entropia_duracion": entropia_duracion_por_compas(score, instrumentos_seleccionados),  # Nota: aquí usamos la función por compás para global también
        "sincronizacion_entrada": sincronizacion_entrada(midi, instrumentos_seleccionados),
        "dispersion_temporal": dispersion_temporal(score, instrumentos_seleccionados),
        "compacidad_melodica": compacidad_melodica(score, instrumentos_seleccionados),
        "repetitividad_motívica": repetitividad_motívica(score, n=3, instrumentos_seleccionados=instrumentos_seleccionados),
        "entropia_melodica": entropia_melodica(score, instrumentos_seleccionados),
        "entropia_ritmica": entropia_ritmica(score, instrumentos_seleccionados),
        "entropia_armonica": entropia_armonica(score, instrumentos_seleccionados),
        "entropia_compuesta": float(round(np.mean([entropia_melodica(score, instrumentos_seleccionados), entropia_ritmica(score, instrumentos_seleccionados), entropia_armonica(score, instrumentos_seleccionados)]), 3)),
        "cantidad_notas_por_compas": notas_por_compas(score, instrumentos_seleccionados),
        "compacidad_melodica_por_compas": compacidad_melodica_por_compas(score, instrumentos_seleccionados),
        "repetitividad_motívica_por_compas": repetitividad_motívica_por_compas(score, n=3, instrumentos_seleccionados=instrumentos_seleccionados),
        "entropia_duracion_por_compas": entropia_duracion_por_compas(score, instrumentos_seleccionados),
        "entropia_armonica_por_compas": entropia_armonica_por_compas(score, instrumentos_seleccionados),
        "densidad_armonica_por_compas": densidad_armonica_por_compas(score, instrumentos_seleccionados),
        "sincronizacion_entrada_por_compas": sincronizacion_entrada_por_compas(score, midi, instrumentos_seleccionados),
        "dispersion_temporal_por_compas": dispersion_temporal_por_compas(score, instrumentos_seleccionados),
        "promedio_rango_dinamico_por_compas": promedio_rango_dinamico_por_compas(midi, score, instrumentos_seleccionados),
        "variabilidad_intervalica_por_compas": variabilidad_intervalica_por_compas(score, instrumentos_seleccionados)
    }