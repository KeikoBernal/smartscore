import os
import pretty_midi
import numpy as np
from collections import Counter, defaultdict
from music21 import converter, note, chord, stream

def validar_metrica(valor, nombre):
    if isinstance(valor, (int, float)) and np.isfinite(valor):
        return float(round(valor, 3))
    print(f"[WARN] Métrica inválida: {nombre} → {valor}")
    return None

def instrumentos_detectados(score):
    return [p.partName or "Parte sin nombre" for p in score.parts]

def cantidad_total_notas(score):
    return sum(
        len([n for n in p.flatten().notes if isinstance(n, note.Note)])
        for p in score.parts
    )

def analizar_midi(nombre_archivo: str, instrumentos_seleccionados=None) -> dict:
    ruta = os.path.join("uploads", nombre_archivo)

    try:
        midi = pretty_midi.PrettyMIDI(ruta)
        score_original = converter.parse(ruta)

        instrumento = None
        score = score_original

        if instrumentos_seleccionados:
            instrumentos_normalizados = [i.strip().lower() for i in instrumentos_seleccionados]

            midi.instruments = [
                inst for inst in midi.instruments
                if inst.name.strip().lower() in instrumentos_normalizados
            ]

            partes_filtradas = [
                p for p in score_original.parts
                if (p.partName or "").strip().lower() in instrumentos_normalizados
            ]

            score_filtrado = stream.Score()
            for parte in partes_filtradas:
                score_filtrado.append(parte)

            score = score_filtrado
            instrumento = instrumentos_seleccionados[0]

        duracion = round(midi.get_end_time(), 2)
        tempo = round(midi.estimate_tempo(), 2)
        compases_aprox = int(duracion / (60 / tempo) / 4) if tempo else 0

        perfil = perfil_compositivo(score)

        return {
            "archivo": nombre_archivo,
            "duracion_segundos": validar_metrica(duracion, "duracion_segundos"),
            "tempo_promedio": validar_metrica(tempo, "tempo_promedio"),
            "instrumentos_detectados": instrumentos_detectados(score),
            "cantidad_total_notas": cantidad_total_notas(score),
            "compases_estimados": compases_aprox,
            "motivos_recurrentes": motivos_recurrentes(score, instrumento=instrumento),
            "progresiones_armonicas": progresiones_armonicas(score, instrumento=instrumento),
            "intervalos_predominantes": intervalos_predominantes(score, instrumento=instrumento),
            "balance_dinamico": balance_dinamico(midi, instrumento=instrumento),
            "familias_instrumentales": clasificar_familias(score),
            "contrapunto_activo": validar_metrica(contrapunto_activo(score, instrumento=instrumento), "contrapunto_activo"),
            "red_interaccion_musical": red_interaccion(score, instrumento=instrumento),
            "entropia_ritmica": validar_metrica(perfil["entropia_ritmica"], "entropia_ritmica"),
            "entropia_melodica": validar_metrica(perfil["entropia_melodica"], "entropia_melodica"),
            "entropia_armonica": validar_metrica(perfil["entropia_armonica"], "entropia_armonica"),
            "entropia_interaccion": validar_metrica(perfil["entropia_interaccion"], "entropia_interaccion"),
            "complejidad_total": validar_metrica(complejidad_total(score), "complejidad_total"),
            "firma_metrica": firma_metrica(score),
            "seccion_aurea": validar_metrica(seccion_aurea(score), "seccion_aurea"),
            "variedad_tonal": validar_metrica(variedad_tonal(score), "variedad_tonal"),
            "innovacion_estadistica": validar_metrica(innovacion_estadistica(score), "innovacion_estadistica"),
            "firma_fractal": validar_metrica(firma_fractal(score), "firma_fractal"),
            "partes_detectadas": partes_detectadas(score),
            "porcentaje_participacion": participacion_por_partes(score)
        }

    except Exception as e:
        return {
            "error": f"No se pudo analizar el archivo: {str(e)}"
        }
# -------------------------------
# Funciones auxiliares
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
    notas = [n for p in partes for n in p.flatten().notes if isinstance(n, note.Note)]
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

def clasificar_familias(score):
    familias = {
        "Cuerdas": [], "Vientos madera": [], "Metales": [],
        "Percusión": [], "Teclado": [], "Otros": []
    }

    instrumento_a_familia = {
        "Violin I": "Cuerdas", "Violin II": "Cuerdas", "Violin": "Cuerdas",
        "Viola": "Cuerdas", "Cello": "Cuerdas", "Contrabass": "Cuerdas",
        "Harp": "Cuerdas", "Classical Guitar": "Cuerdas", "Mandolin": "Cuerdas", "Lute": "Cuerdas",
        "Flute": "Vientos madera", "Piccolo": "Vientos madera", "Clarinet": "Vientos madera",
        "Bass Clarinet": "Vientos madera", "Alto Clarinet": "Vientos madera", "Contrabass Clarinet": "Vientos madera",
        "Oboe": "Vientos madera", "English Horn": "Vientos madera", "Bassoon": "Vientos madera", "Contrabassoon": "Vientos madera",
        "Saxophone": "Vientos madera",
        "Trumpet": "Metales", "Piccolo Trumpet": "Metales", "French Horn": "Metales", "Horn": "Metales",
        "Trombone": "Metales", "Bass Trombone": "Metales", "Tuba": "Metales",
        "Euphonium": "Metales", "Cornet": "Metales", "Helicon": "Metales", "Fiscornio": "Metales",
        "Timpani": "Percusión", "Marimba": "Percusión", "Xylophone": "Percusión", "Vibraphone": "Percusión",
        "Glockenspiel": "Percusión", "Tubular Bells": "Percusión", "Celesta": "Percusión",
        "Bass Drum": "Percusión", "Snare Drum": "Percusión", "Cymbals": "Percusión", "Triangle": "Percusión",
        "Tambourine": "Percusión", "Gong": "Percusión", "Woodblock": "Percusión", "Castanets": "Percusión",
        "Piano": "Teclado", "Harpsichord": "Teclado", "Organ": "Teclado", "Clavichord": "Teclado",
        "Harmonium": "Teclado", "Glass Harmonica": "Teclado"
    }

    claves_ordenadas = sorted(instrumento_a_familia.keys(), key=lambda x: -len(x))

    def encontrar_familia(nombre):
        nombre_normalizado = nombre.strip().lower()
        for clave in claves_ordenadas:
            clave_normalizada = clave.lower()
            if nombre_normalizado == clave_normalizada:
                return instrumento_a_familia[clave]
            if nombre_normalizado.startswith(clave_normalizada):
                                return instrumento_a_familia[clave]
        return "Otros"

    for p in score.parts:
        nombre = p.partName or "Parte sin nombre"
        familia = encontrar_familia(nombre)
        familias[familia].append(nombre)

    return familias

def contrapunto_activo(score, instrumento=None):
    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]
    if len(partes) < 2:
        return 0.0
    entropias = []
    for p in partes:
        notas = [n.pitch.midi for n in p.flatten().notes if isinstance(n, note.Note)]
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
        for n in p.flatten().notes:
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

def partes_detectadas(score):
    partes_info = []
    for p in score.parts:
        nombre = p.partName or "Parte sin nombre"
        notas = [n for n in p.flatten().notes if isinstance(n, note.Note)]
        partes_info.append({
            "nombre": nombre,
            "notas": len(notas)
        })
    return partes_info

def participacion_por_partes(score):
    conteo = {}
    total = 0
    for p in score.parts:
        nombre = p.partName or "Parte sin nombre"
        notas = [n for n in p.flatten().notes if isinstance(n, note.Note)]
        conteo[nombre] = len(notas)
        total += len(notas)

    return {
        nombre: round((cantidad / total) * 100, 2)
        for nombre, cantidad in conteo.items()
        if total > 0
    }

# -------------------------------
# Métricas globales
# -------------------------------

def perfil_compositivo(score):
    return {
        "entropia_ritmica": entropia_ritmica(score),
        "entropia_melodica": entropia_melodica(score),
        "entropia_armonica": entropia_armonica(score),
        "entropia_interaccion": entropia_interaccion(score)
    }

def entropia_ritmica(score):
    duraciones = [n.quarterLength for p in score.parts for n in p.flat.notes if isinstance(n, note.Note)]
    if not duraciones:
        return 0.0
    hist = np.histogram(duraciones, bins=16)[0]
    prob = hist / np.sum(hist)
    return float(round(-np.sum(prob * np.log2(prob + 1e-9)), 3))

def entropia_melodica(score):
    alturas = [n.pitch.midi for p in score.parts for n in p.flat.notes if isinstance(n, note.Note)]
    if not alturas:
        return 0.0
    hist = np.histogram(alturas, bins=24)[0]
    prob = hist / np.sum(hist)
    return float(round(-np.sum(prob * np.log2(prob + 1e-9)), 3))

def entropia_armonica(score):
    acordes = [c.root().name for p in score.parts for c in p.chordify().recurse().getElementsByClass(chord.Chord)]
    if not acordes:
        return 0.0
    letras = [ord(a[0]) for a in acordes if a]
    if not letras:
        return 0.0
    hist = np.histogram(letras, bins=12)[0]
    prob = hist / np.sum(hist)
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def entropia_interaccion(score):
    red = red_interaccion(score)
    grados = [v for v in red.values()]
    if not grados:
        return 0.0
    prob = np.array(grados) / np.sum(grados)
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def complejidad_total(score):
    perfil = perfil_compositivo(score)
    valores = [v for v in perfil.values() if isinstance(v, (int, float)) and np.isfinite(v)]
    return float(round(sum(valores), 3)) if valores else 0.0

def firma_metrica(score):
    compases = score.parts[0].getElementsByClass(stream.Measure)
    duraciones = [m.duration.quarterLength for m in compases]
    return dict(Counter(duraciones))

def seccion_aurea(score):
    return float(round(score.highestTime * 0.618, 2))

def variedad_tonal(score):
    tonalidades = set()
    for el in score.recurse():
        if el.classes[0] == 'Key':
            tonalidades.add(el.tonic.name)
    return len(tonalidades)

def innovacion_estadistica(score):
    perfil = perfil_compositivo(score)
    valores = [v for v in perfil.values() if isinstance(v, (int, float)) and np.isfinite(v)]
    return float(round(np.mean(valores), 3)) if valores else 0.0

def firma_fractal(score):
    notas = [n.offset for p in score.parts for n in p.flat.notes if isinstance(n, note.Note)]
    if len(notas) < 2:
        return 0.0
    escalas = [1, 2, 4, 8]
    variaciones = []
    for s in escalas:
        agrupadas = [notas[i:i+s] for i in range(0, len(notas), s)]
        medias = [np.mean(g) for g in agrupadas if g]
        variaciones.append(np.std(medias))
    return float(round(np.std(variaciones), 3))