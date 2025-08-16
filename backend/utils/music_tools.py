import numpy as np
from collections import Counter, defaultdict

# 🔧 Funciones auxiliares
def contar_intervalos(pitches):
    intervalos = []
    for i in range(1, len(pitches)):
        intervalo = abs(pitches[i] - pitches[i - 1])
        intervalos.append(intervalo)
    return Counter(intervalos)

def calcular_entropia(distribucion):
    total = sum(distribucion.values())
    if total == 0:
        return 0.0
    probs = [v / total for v in distribucion.values()]
    return round(-sum(p * np.log2(p) for p in probs if p > 0), 3)

# 🎻 Instrumentales
def densidad_instrumental(data): return {}
def frecuencia_aparicion(data): return {}
def duracion_promedio_por_familia(data): return {}
def distribucion_por_familia(data): return {}
def solismo_vs_tutti(data): return []
def participacion_instrumental(data): return {}

# 🎶 Melódicas
def intervalos_predominantes(data):
    pitches = [note["pitch"] for note in data["notes"]]
    return dict(contar_intervalos(pitches))

def direccionalidad_melodica(data): return {}
def ambitus(data):
    midi_pitches = [note["pitch"] for note in data["notes"]]
    if not midi_pitches: return 0
    return max(midi_pitches) - min(midi_pitches)

def motivos_recurrentes(data): return []
def entropia_melodica(data):
    pitches = [note["pitch"] for note in data["notes"]]
    return calcular_entropia(Counter(pitches))

def variabilidad_melodica(data): return []

# 🥁 Rítmicas
def densidad_ritmica(data):
    total_notes = len(data["notes"])
    duracion_total = max(note["start"] + note["duration"] for note in data["notes"])
    return round(total_notes / duracion_total, 3)

def duraciones_predominantes(data):
    duraciones = [note["duration"] for note in data["notes"]]
    return dict(Counter(duraciones))

def complejidad_ritmica(data): return []
def polirritmia(data): return 0.0
def entropia_ritmica(data):
    compases = defaultdict(list)
    for note in data["notes"]:
        compas = int(note["start"])
        compases[compas].append(note["duration"])
    return [calcular_entropia(Counter(d)) for d in compases.values()]

# 🎼 Armónicas
def progresiones(data): return []
def tension_armonica(data): return []
def modulaciones(data): return []
def distribucion_acordes(data): return {}
def entropia_armonica(data): return []

# 🧵 Texturales
def tipo_textura(data): return "homofonía"
def voces_simultaneas(data): return []
def distribucion_espacial(data): return {}
def balance_dinamico(data): return {}

# 🧩 Formales
def segmentacion_formal(data): return []
def duracion_secciones(data): return {}
def repeticion_tematica(data): return []
def simetria_formal(data): return 0.0

# 🤝 Interacción
def red_interaccion(data): return {}
def simultaneidad_tematica(data): return {}
def contrapunto_activo(data): return 0.0
def entropia_interaccion(data): return 0.0
def fractalidad(data): return {}

# 🌐 Globales
def perfil_compositivo(data): return {}
def indice_innovacion(data): return 0.0
def complejidad_total(data): return 0.0
def firma_metrica(data): return {}

# 🧠 Diferenciadoras
def entropia_combinada(data):
    return {
        "melodica": entropia_melodica(data),
        "ritmica": np.mean(entropia_ritmica(data)),
        "armonica": 0.0
    }

def simetria_formal_diferenciadora(data): return 0.0
def seccion_aurea(data): return []
def variedad_tonal(data): return {}
def complejidad_ritmica_cuantificable(data): return 0.0
def red_interaccion_densa(data): return {}
def innovacion_estadistica(data): return {}
def firma_fractal(data): return {}

# 🧠 Diccionario para calculator.py
METRICAS = {
    "instrumentales": {
        "densidad_instrumental": densidad_instrumental,
        "frecuencia_aparicion": frecuencia_aparicion,
        "duracion_promedio_por_familia": duracion_promedio_por_familia,
        "distribucion_por_familia": distribucion_por_familia,
        "solismo_vs_tutti": solismo_vs_tutti,
        "participacion_instrumental": participacion_instrumental
    },
    "melodicas": {
        "intervalos_predominantes": intervalos_predominantes,
        "direccionalidad_melodica": direccionalidad_melodica,
        "ambitus": ambitus,
        "motivos_recurrentes": motivos_recurrentes,
        "entropia_melodica": entropia_melodica,
        "variabilidad_melodica": variabilidad_melodica
    },
    "ritmicas": {
        "densidad_ritmica": densidad_ritmica,
        "duraciones_predominantes": duraciones_predominantes,
        "complejidad_ritmica": complejidad_ritmica,
        "polirritmia": polirritmia,
        "entropia_ritmica": entropia_ritmica
    },
    "armonicas": {
        "progresiones": progresiones,
        "tension_armonica": tension_armonica,
        "modulaciones": modulaciones,
        "distribucion_acordes": distribucion_acordes,
        "entropia_armonica": entropia_armonica
    },
    "texturales": {
        "tipo_textura": tipo_textura,
        "voces_simultaneas": voces_simultaneas,
        "distribucion_espacial": distribucion_espacial,
        "balance_dinamico": balance_dinamico
    },
    "formales": {
        "segmentacion_formal": segmentacion_formal,
        "duracion_secciones": duracion_secciones,
        "repeticion_tematica": repeticion_tematica,
        "simetria_formal": simetria_formal
    },
    "interaccion": {
        "red_interaccion": red_interaccion,
        "simultaneidad_tematica": simultaneidad_tematica,
        "contrapunto_activo": contrapunto_activo,
        "entropia_interaccion": entropia_interaccion,
        "fractalidad": fractalidad
    },
    "globales": {
        "perfil_compositivo": perfil_compositivo,
        "indice_innovacion": indice_innovacion,
        "complejidad_total": complejidad_total,
        "firma_metrica": firma_metrica
    },
    "diferenciadoras": {
        "entropia_combinada": entropia_combinada,
        "simetria_formal": simetria_formal_diferenciadora,
        "seccion_aurea": seccion_aurea,
        "variedad_tonal": variedad_tonal,
        "complejidad_ritmica_cuantificable": complejidad_ritmica_cuantificable,
        "red_interaccion_densa": red_interaccion_densa,
        "innovacion_estadistica": innovacion_estadistica,
        "firma_fractal": firma_fractal
    }
}