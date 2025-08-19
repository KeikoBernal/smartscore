from music21 import converter, stream, note, chord, meter, pitch, expressions
from sklearn.cluster import KMeans
import numpy as np
import pretty_midi
from collections import defaultdict
import os

# -------------------------------
# Funciones auxiliares
# -------------------------------

def motivos_recurrentes(compases, n=3, instrumento=None):
    motivos = {}
    for m in compases:
        notas = [
            n.pitch.midi for n in m.notes
            if isinstance(n, note.Note) and (instrumento is None or getattr(n.getInstrument(), 'instrumentName', None) == instrumento)
        ]
        for i in range(len(notas) - n + 1):
            motivo = tuple(notas[i:i+n])
            clave = "-".join(str(p) for p in motivo)
            motivos[clave] = motivos.get(clave, 0) + 1
    return {k: int(v) for k, v in motivos.items() if v > 1}

def progresiones_armonicas(score, instrumento=None):
    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]
    acordes = partes[0].chordify().recurse().getElementsByClass(chord.Chord) if partes else []
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
        energia[nombre] = float(np.mean([n.velocity for n in inst.notes])) if inst.notes else 0.0
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

def calcular_ambitus(m):
    notas = [n for n in m.notes if isinstance(n, note.Note)]
    if not notas:
        return {"min": None, "max": None}
    alturas = [n.pitch for n in notas]
    return {
        "min": min(alturas).nameWithOctave,
        "max": max(alturas).nameWithOctave
    }

def extraer_articulaciones(m):
    articulaciones = []
    for n in m.notes:
        if hasattr(n, 'articulations'):
            articulaciones.extend([type(a).__name__ for a in n.articulations])
    return articulaciones

def extraer_dinamicas(m):
    dinamicas = []
    for elemento in m:
        if hasattr(elemento, 'expressions'):
            for expr in elemento.expressions:
                if isinstance(expr, expressions.TextExpression) and hasattr(expr, 'content'):
                    dinamicas.append(expr.content)
                elif hasattr(expr, 'value'):
                    dinamicas.append(expr.value)
        elif isinstance(elemento, expressions.TextExpression) and hasattr(elemento, 'content'):
            dinamicas.append(elemento.content)
        elif hasattr(elemento, 'value'):
            dinamicas.append(elemento.value)
    return dinamicas

def detectar_crescendo(m):
    wedges = m.getElementsByClass('Wedge')
    for w in wedges:
        if w.type == 'crescendo':
            return "crescendo"
        elif w.type == 'diminuendo':
            return "diminuendo"
    return "estable"

def estimar_dinamica(m):
    notas = [n for n in m.notes if n.isNote]
    densidad = len(notas)
    ambitus = calcular_ambitus(m)
    if ambitus["min"] and ambitus["max"]:
        rango = pitch.Pitch(ambitus["max"]).midi - pitch.Pitch(ambitus["min"]).midi
    else:
        rango = 0
    instrumentos = len(set(n.partId for n in m.notes if hasattr(n, 'partId')))
    intensidad = densidad + 0.5 * rango + 2 * instrumentos

    if intensidad > 25:
        return "forte estimado"
    elif intensidad > 15:
        return "mezzo-forte estimado"
    elif intensidad > 8:
        return "mezzo-piano estimado"
    else:
        return "piano estimado"

def vector_textura(m):
    notas = [n for n in m.notes if isinstance(n, note.Note) or isinstance(n, chord.Chord)]
    densidad = len(notas)
    ambitus = calcular_ambitus(m)
    if ambitus["min"] and ambitus["max"]:
        rango = pitch.Pitch(ambitus["max"]).midi - pitch.Pitch(ambitus["min"]).midi
    else:
        rango = 0
    acordes = len([n for n in notas if isinstance(n, chord.Chord)])
    instrumentos = len(set(n.partId for n in notas if hasattr(n, 'partId')))
    return [int(densidad), int(rango), int(acordes), int(instrumentos)]

def etiquetar_secciones(vectores, n_clusters=4):
    X = np.array(vectores)
    kmeans = KMeans(n_clusters=n_clusters, random_state=42).fit(X)
    return [int(label) for label in kmeans.labels_]

def detectar_transiciones(vectores, threshold=10.0):
    transiciones = []
    for i in range(1, len(vectores)):
        delta = np.linalg.norm(np.array(vectores[i]) - np.array(vectores[i-1]))
        if delta > threshold:
            transiciones.append(i)
    return transiciones

def calcular_variabilidad_densidad(vectores):
    densidades = [v[0] for v in vectores]
    variabilidad = []
    for i in range(1, len(densidades)):
        delta = densidades[i] - densidades[i-1]
        if delta > 5:
            variabilidad.append("crescendo")
        elif delta < -5:
            variabilidad.append("diminuendo")
        else:
            variabilidad.append("estable")
    variabilidad.insert(0, "estable")
    return variabilidad

def extraer_energia_midi(midi_path, total_compases, instrumentos_seleccionados=None):
    midi = pretty_midi.PrettyMIDI(midi_path)
    if instrumentos_seleccionados:
        midi.instruments = [
                    inst for inst in midi.instruments
        if inst.name.strip() in instrumentos_seleccionados
    ]
    duracion_total = midi.get_end_time()
    duracion_compas = duracion_total / total_compases
    energia_por_compas = []

    for i in range(total_compases):
        inicio = i * duracion_compas
        fin = (i + 1) * duracion_compas
        notas = [n for inst in midi.instruments for n in inst.notes if inicio <= n.start < fin]
        energia = np.mean([n.velocity for n in notas]) if notas else 0
        energia_por_compas.append(float(round(energia, 2)))
    return energia_por_compas

def densidad_instrumental_por_compas(midi_path, total_compases, instrumentos_seleccionados=None):
    midi = pretty_midi.PrettyMIDI(midi_path)
    if instrumentos_seleccionados:
        midi.instruments = [
            inst for inst in midi.instruments
            if inst.name.strip() in instrumentos_seleccionados
        ]

    duracion_total = midi.get_end_time()
    duracion_compas = duracion_total / total_compases
    resultado = []

    for i in range(total_compases):
        inicio = i * duracion_compas
        fin = (i + 1) * duracion_compas
        instrumentos_activos = set()

        for inst in midi.instruments:
            notas = [n for n in inst.notes if inicio <= n.start < fin]
            if notas:
                nombre = inst.name.strip() or pretty_midi.program_to_instrument_name(inst.program)
                instrumentos_activos.add(nombre)

        resultado.append({
            "instrumentos": sorted(list(instrumentos_activos)),
            "cantidad": int(len(instrumentos_activos))
        })

    return resultado

def ritmo_armonico(m):
    acordes = [n for n in m.notes if isinstance(n, chord.Chord)]
    nombres = set(c.pitchedCommonName for c in acordes)
    return len(nombres)

def curva_tension(m, ritmo_armonico):
    notas = [n for n in m.notes if isinstance(n, note.Note)]
    alturas = [n.pitch.midi for n in notas]
    if not alturas:
        return 0.0
    variacion = np.std(alturas)
    tension = variacion * ritmo_armonico
    return float(round(tension, 2))

def complejidad_ritmica(m):
    duraciones = [n.quarterLength for n in m.notes]
    if not duraciones:
        return 0.0
    hist = np.histogram(duraciones, bins=8)[0]
    prob = hist / np.sum(hist)
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def detectar_polirritmia(m):
    duraciones = [n.quarterLength for n in m.notes]
    subdivs = set(int(1 / d) if d < 1 else int(d) for d in duraciones if d > 0)
    if len(subdivs) >= 2:
        mcm = int(np.lcm.reduce(list(subdivs)))
        return {"subdivisiones": sorted([int(s) for s in subdivs]), "mcm": mcm}
    return {"subdivisiones": sorted([int(s) for s in subdivs]), "mcm": None}

def simetria_formal(compases):
    n = len(compases)
    mitad = n // 2
    atributos = lambda m: len(m.notes) + len(m.getElementsByClass(chord.Chord))
    A = [atributos(m) for m in compases[:mitad]]
    B = [atributos(m) for m in compases[-mitad:]]
    if len(A) != len(B):
        return 0.0
    corr = np.corrcoef(A, B)[0, 1]
    return float(round(corr, 3))

# -------------------------------
# Función principal
# -------------------------------

def analizar_compases(nombre_archivo: str, instrumentos_seleccionados=None):
    ruta = os.path.join("uploads", nombre_archivo)
    score = converter.parse(ruta)
    midi = pretty_midi.PrettyMIDI(ruta)

    if instrumentos_seleccionados:
        midi.instruments = [
            inst for inst in midi.instruments
            if inst.name.strip() in instrumentos_seleccionados
        ]
        score.parts = [
            p for p in score.parts
            if p.partName in instrumentos_seleccionados
        ]

    compases = score.parts[0].getElementsByClass(stream.Measure)
    vectores = []
    resultado = []

    for m in compases:
        vectores.append(vector_textura(m))

    etiquetas = etiquetar_secciones(vectores, n_clusters=4)
    transiciones = detectar_transiciones(vectores, threshold=10.0)
    variabilidad = calcular_variabilidad_densidad(vectores)
    energia_por_compas = extraer_energia_midi(ruta, len(compases), instrumentos_seleccionados)
    instrumentos_por_compas = densidad_instrumental_por_compas(ruta, len(compases), instrumentos_seleccionados)

    instrumento = instrumentos_seleccionados[0] if instrumentos_seleccionados else None

    motivos = motivos_recurrentes(compases, instrumento=instrumento)
    progresiones = progresiones_armonicas(score, instrumento=instrumento)
    intervalos = intervalos_predominantes(score, instrumento=instrumento)
    balance = balance_dinamico(midi, instrumento=instrumento)
    familias = clasificar_familias(midi)
    contrapunto = contrapunto_activo(score, instrumento=instrumento)
    red = red_interaccion(score, instrumento=instrumento)

    for i, m in enumerate(compases):
        ritmo = ritmo_armonico(m)
        tension = curva_tension(m, ritmo)
        ritmo_complejo = complejidad_ritmica(m)

        datos = {
            "numero": int(m.number),
            "compas": str(m.timeSignature) if m.timeSignature else None,
            "duracion": float(m.duration.quarterLength),
            "notas": int(len([n for n in m.notes if isinstance(n, note.Note)])),
            "acordes": int(len([n for n in m.notes if isinstance(n, chord.Chord)])),
            "ambitus": calcular_ambitus(m),
            "articulaciones": extraer_articulaciones(m),
            "dinamicas": extraer_dinamicas(m) + [estimar_dinamica(m)],
            "crescendo": detectar_crescendo(m),
            "energia": float(energia_por_compas[i]) if energia_por_compas else None,
            "variabilidad_densidad": variabilidad[i],
            "seccion": f"Sección {chr(65 + etiquetas[i])}",
            "transicion": i in transiciones,
            "ritmo_armonico": int(ritmo),
            "curva_tension": float(tension),
            "complejidad_ritmica": float(ritmo_complejo),
            "instrumentos_activos": instrumentos_por_compas[i]["instrumentos"],
            "cantidad_instrumentos": int(instrumentos_por_compas[i]["cantidad"]),
            "polirritmia": detectar_polirritmia(m)
        }
        resultado.append(datos)

    resultado.append({
        "global": {
            "motivos_recurrentes": motivos,
            "progresiones_armonicas": progresiones,
            "intervalos_predominantes": [int(i) for i in intervalos],
            "balance_dinamico": {k: float(v) for k, v in balance.items()},
            "familias_instrumentales": familias,
            "simetria_formal": float(simetria_formal(compases)),
            "contrapunto_activo": float(contrapunto),
            "red_interaccion_musical": red
        }
    })

    return resultado