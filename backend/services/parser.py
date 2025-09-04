import os
import numpy as np
import pretty_midi
import numpy as np
from collections import Counter, defaultdict
from music21 import converter, note, chord, stream, interval, pitch

def validar_metrica(valor, nombre):
    if isinstance(valor, (int, float)) and np.isfinite(valor):
        return float(round(valor, 3))
    print(f"[WARN] Métrica inválida: {nombre} → {valor}")
    return None

def instrumentos_detectados(score):
    return [p.partName or "Parte sin nombre" for p in score.parts]

def cantidad_total_notas(score):
    total_notas = 0
    conteo_por_nota = defaultdict(int)
    for p in score.parts:
        for n in p.flatten().notes:
            if isinstance(n, note.Note):
                total_notas += 1
                conteo_por_nota[n.nameWithOctave] += 1
    return {
        "total": total_notas,
        "por_nota": dict(conteo_por_nota)
    }

def seccion_aurea_por_compas(score): # Nueva función
    resultados = []
    if not score.parts:
        return []
    compases_lista = score.parts[0].getElementsByClass(stream.Measure)
    for m in compases_lista:
        punto_seccion_aurea_compas = m.duration.quarterLength * 0.618
        resultados.append({f"compas #{m.number}": float(round(punto_seccion_aurea_compas, 3))})
    return resultados

def compases_no_vacios_por_instrumento(score): # Nueva función
    resultados = {}
    for p in score.parts:
        nombre_instrumento = p.partName or "Parte sin nombre"
        conteo_compases = 0
        for m in p.getElementsByClass(stream.Measure):
            # Cuenta compases que tienen al menos una nota o un silencio
            if any(isinstance(el, (note.Note, note.Rest)) for el in m.flat.notesAndRests):
                conteo_compases += 1
        resultados[nombre_instrumento] = conteo_compases
    return resultados

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
                inst for inst in midi.instruments if inst.name.strip().lower() in instrumentos_normalizados
            ]

            partes_filtradas = [
                p for p in score_original.parts
                if (p.partName or "").strip().lower() in instrumentos_normalizados
            ]

            score_filtrado = stream.Score()
            for parte in partes_filtradas:
                score_filtrado.append(parte)

            score = score_filtrado
            if instrumentos_seleccionados and len(instrumentos_seleccionados) == 1:
                instrumento = instrumentos_seleccionados[0]

        duracion = round(midi.get_end_time(), 2)
        tempo = round(midi.estimate_tempo(), 2)
        # compases_aprox = int(duracion / (60 / tempo) / 4) if tempo else 0 # Eliminado o renombrado

        perfil = perfil_compositivo(score)

        return {
            "archivo": nombre_archivo,
            "duracion_segundos": validar_metrica(duracion, "duracion_segundos"),
            "tempo_promedio": validar_metrica(tempo, "tempo_promedio"),
            "instrumentos_detectados": instrumentos_detectados(score),
            "cantidad_total_notas": cantidad_total_notas(score),
            "compases_estimados": compases_no_vacios_por_instrumento(score), # Usar la nueva función
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
            "complejidad_total": validar_metrica(complejidad_total(score, instrumento=instrumento), "complejidad_total"), # Modificado
            "firma_metrica": firma_metrica(score),
            "seccion_aurea": validar_metrica(seccion_aurea(score), "seccion_aurea"),
            "variedad_tonal": validar_metrica(variedad_tonal(score), "variedad_tonal"),
            "innovacion_estadistica": validar_metrica(innovacion_estadistica(score), "innovacion_estadistica"),
            "firma_fractal": validar_metrica(firma_fractal(score, instrumento=instrumento), "firma_fractal"), # Modificado
            "partes_detectadas": partes_detectadas(score),
            "porcentaje_participacion": participacion_por_partes(score),
            "cantidad_notas_por_compas": notas_por_compas(score, instrumentos_seleccionados)
        }

    except Exception as e:
        return {
            "error": f"No se pudo analizar el archivo: {str(e)}"
        }

def motivos_recurrentes(score, n=3, instrumento=None):
    motivos_conteo = defaultdict(int)
    motivos_notacion = {}

    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]

    for p in partes:
        if not p.getElementsByClass('Measure'):
            continue
        
        for m in p.getElementsByClass('Measure'):
            notas_en_compas = [n for n in m.notes if isinstance(n, note.Note)]
            notas_midi = [n.pitch.midi for n in notas_en_compas]
            notas_nombre = [n.nameWithOctave for n in notas_en_compas]

            for i in range(len(notas_midi) - n + 1):
                motivo_midi = tuple(notas_midi[i:i+n])
                motivo_nombre = tuple(notas_nombre[i:i+n])
                clave = "-".join(str(p_midi) for p_midi in motivo_midi)
                motivos_conteo[clave] += 1
                if clave not in motivos_notacion:
                    motivos_notacion[clave] = list(motivo_nombre)

    resultados = {}
    for clave, conteo in motivos_conteo.items():
        if conteo > 1:
            resultados[clave] = {
                "conteo": conteo,
                "notacion": motivos_notacion.get(clave, [])
            }
    return resultados



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

def progresiones_armonicas(score, instrumento=None):
    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]    
    if not partes:
        return {}
    score_para_chordify = stream.Score()
    for p in partes:
        score_para_chordify.append(p)

    acordes = score_para_chordify.chordify().recurse().getElementsByClass(chord.Chord)
    nombres_acordes = [c.pitchedCommonName for c in acordes if c.pitchedCommonName]

    conteo_acordes = Counter(nombres_acordes)

    progresiones = []
    for i in range(len(nombres_acordes) - 2):
        progresion = tuple(nombres_acordes[i:i+3])
        progresiones.append(progresion)
    conteo_progresiones = Counter(progresiones)

    resultado = {
        "acordes": dict(conteo_acordes),
        "progresiones_2_acordes": {f"{p[0]} -> {p[1]} -> {p[2]}": c for p, c in conteo_progresiones.items()}
    }
    return resultado

def intervalos_predominantes(score, instrumento=None):
    def intervalo_nombre(real_valor):
        nombres_intervalos = {
            0: "Unísono",
            1: "Segunda menor",
            2: "Segunda mayor",
            3: "Tercera menor",
            4: "Tercera mayor",
            5: "Cuarta justa",
            6: "Tritono (Cuarta aumentada / Quinta disminuida)",
            7: "Quinta justa",
            8: "Sexta menor",
            9: "Sexta mayor",
            10: "Séptima menor",
            11: "Séptima mayor",
            12: "Octava justa"
        }
        direccion = "ascendente" if real_valor > 0 else "descendente"
        val_abs = abs(real_valor)
        nombre = nombres_intervalos.get(val_abs, f"Intervalo desconocido ({real_valor})")
        return f"{nombre} ({direccion})" if val_abs != 0 else nombre

    partes = score.parts
    if instrumento:
        partes = [p for p in partes if p.partName == instrumento]

    notas_midi = []
    for p in partes:
        for n in p.flatten().notes:
            if isinstance(n, note.Note):
                notas_midi.append(n.pitch.midi)

    intervalos_raw = [
        notas_midi[i] - notas_midi[i-1]
        for i in range(1, len(notas_midi))
    ]

    if not intervalos_raw:
        return {"valores": [], "predominantes": [], "nombres": []}

    conteo_intervalos = Counter(intervalos_raw)
    max_frecuencia = max(conteo_intervalos.values()) if conteo_intervalos else 0

    predominantes_valores = [
        val for val, count in conteo_intervalos.items()
        if count == max_frecuencia
    ]

    predominantes_nombres = [intervalo_nombre(val) for val in predominantes_valores]

    return {
        "valores": intervalos_raw,
        "predominantes": predominantes_valores,
        "nombres": predominantes_nombres
    }

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

def contrapunto_activo(score, instrumento=None): # Modificado para aceptar instrumento
    partes_a_analizar = score.parts
    if instrumento:
        partes_a_analizar = [p for p in score.parts if p.partName == instrumento]
    
    if len(partes_a_analizar) < 2:
        return 0.0
    
    entropias = []
    for p in partes_a_analizar:
        notas = [n.pitch.midi for n in p.flatten().notes if isinstance(n, note.Note)]
        if notas:
            hist = np.histogram(notas, bins=12)[0]
            prob = hist / np.sum(hist)
            prob = prob[prob > 0] # Asegurarse de que no haya ceros
            if prob.size == 0: # Añadido: Manejar caso de prob vacío
                entropia = 0.0
            else:
                entropia = -np.sum(prob * np.log2(prob + 1e-9))
            entropias.append(entropia)
    
    if len(entropias) < 2:
        return 0.0
    return float(round(np.std(entropias), 3))
    
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

def perfil_compositivo(score, instrumento=None): # Modificado para aceptar instrumento
    return {
        "entropia_ritmica": entropia_ritmica(score, instrumentos_seleccionados=[instrumento] if instrumento else None),
        "entropia_melodica": entropia_melodica(score, instrumentos_seleccionados=[instrumento] if instrumento else None),
        "entropia_armonica": entropia_armonica(score, instrumentos_seleccionados=[instrumento] if instrumento else None),
        "entropia_interaccion": entropia_interaccion(score, instrumentos_seleccionados=[instrumento] if instrumento else None)
    }

def entropia_ritmica(score, instrumentos_seleccionados=None): # Modificado para aceptar instrumentos_seleccionados
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
    if prob.size == 0: # Añadido: Manejar caso de prob vacío
        return 0.0
    return float(round(-np.sum(prob * np.log2(prob + 1e-9)), 3))

def entropia_melodica(score, instrumentos_seleccionados=None): # Modificado para aceptar instrumentos_seleccionados
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
    if prob.size == 0: # Añadido: Manejar caso de prob vacío
        return 0.0
    return float(round(-np.sum(prob * np.log2(prob + 1e-9)), 3))

def entropia_armonica(score, instrumentos_seleccionados=None): # Modificado para aceptar instrumentos_seleccionados
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
    if not letras:
        return 0.0
    hist = np.histogram(letras, bins=12)[0]
    prob = hist / np.sum(hist)
    prob = prob[prob > 0]
    if prob.size == 0: # Añadido: Manejar caso de prob vacío
        return 0.0
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def entropia_interaccion(score, instrumentos_seleccionados=None): # Modificado para aceptar instrumentos_seleccionados
    red = red_interaccion(score, instrumento=instrumentos_seleccionados[0] if instrumentos_seleccionados else None)
    grados = [v for v in red.values()]
    if not grados:
        return 0.0
    prob = np.array(grados) / np.sum(grados)
    prob = prob[prob > 0] # Asegurarse de que no haya ceros
    if prob.size == 0: # Añadido: Manejar caso de prob vacío
        return 0.0
    entropia = -np.sum(prob * np.log2(prob + 1e-9))
    return float(round(entropia, 3))

def complejidad_total(score, instrumento=None): # Modificado para aceptar instrumento
    perfil = perfil_compositivo(score, instrumento=instrumento)
    valores = [v for v in perfil.values() if isinstance(v, (int, float)) and np.isfinite(v)]
    return float(round(sum(valores), 3)) if valores else 0.0

def firma_metrica(score):
    if not score.parts:
        return {}
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

def firma_fractal(score, instrumento=None): # Modificado para aceptar instrumento
    partes_a_analizar = score.parts
    if instrumento:
        partes_a_analizar = [p for p in score.parts if p.partName == instrumento]
    notas = [n.offset for p in partes_a_analizar for n in p.flat.notes if isinstance(n, note.Note)]
    if len(notas) < 2:
        return 0.0
    escalas = [1, 2, 4, 8]
    variaciones = []
    for s in escalas:
        agrupadas = [notas[i:i+s] for i in range(0, len(notas), s)]
        medias = [np.mean(g) for g in agrupadas if g]
        variaciones.append(np.std(medias))
    return float(round(np.std(variaciones), 3))

def notas_por_compas(score, instrumentos_seleccionados=None):
    resultados_por_compas = []
    if not score.parts:
        return resultados_por_compas
    compases = score.parts[0].getElementsByClass(stream.Measure)
    for i, m in enumerate(compases):
        notas = []
        for p in score.parts:
            if instrumentos_seleccionados and p.partName not in instrumentos_seleccionados:
                continue
            compas_parte = p.measure(m.number)
            if compas_parte:
                notas.extend([n for n in compas_parte.notes if isinstance(n, note.Note)])
        resultados_por_compas.append({f"compas #{i+1}": len(notas)})
    return resultados_por_compas