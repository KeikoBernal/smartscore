from pretty_midi import PrettyMIDI, Instrument, Note
import os

def crear_midi_sintetico(ruta_destino):
    midi = PrettyMIDI()

    # Piano
    piano = Instrument(program=0, name="Piano")
    piano.notes.append(Note(velocity=80, pitch=60, start=0.0, end=0.5))
    piano.notes.append(Note(velocity=85, pitch=62, start=1.0, end=1.5))
    piano.notes.append(Note(velocity=90, pitch=64, start=2.0, end=2.5))
    midi.instruments.append(piano)

    # Violin
    violin = Instrument(program=40, name="Violin")
    violin.notes.append(Note(velocity=70, pitch=67, start=0.2, end=0.7))
    violin.notes.append(Note(velocity=75, pitch=69, start=1.2, end=1.7))
    violin.notes.append(Note(velocity=80, pitch=71, start=2.2, end=2.7))
    midi.instruments.append(violin)

    os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)
    midi.write(ruta_destino)
    print(f"✅ MIDI sintético guardado en: {ruta_destino}")

# Ejecutar
crear_midi_sintetico("tests/fixtures/ejemplo.mid")