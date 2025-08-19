import pretty_midi
import os

def analizar_midi(nombre_archivo: str) -> dict:
    ruta = os.path.join("uploads", nombre_archivo)

    try:
        midi = pretty_midi.PrettyMIDI(ruta)

        duracion = round(midi.get_end_time(), 2)
        tempo = round(midi.estimate_tempo(), 2)
        instrumentos = [inst.name or "Instrumento desconocido" for inst in midi.instruments]
        compases_aprox = int(duracion / (60 / tempo) / 4)  # Asumiendo compás de 4/4

        return {
            "archivo": nombre_archivo,
            "duracion_segundos": duracion,
            "tempo_promedio": tempo,
            "instrumentos_detectados": instrumentos,
            "compases_estimados": compases_aprox
        }

    except Exception as e:
        return {"error": f"No se pudo analizar el archivo: {str(e)}"}