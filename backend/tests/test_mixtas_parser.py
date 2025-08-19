import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services")))
from mixtas_parser import analizar_mixtas

def test_analizar_mixtas_completo():
    # Ruta de prueba
    midi_path = os.path.join("tests", "fixtures", "ejemplo.mid")
    assert os.path.exists(midi_path), "⚠️ Archivo MIDI de prueba no encontrado"

    # Sin filtrado
    resultado_global = analizar_mixtas(midi_path)
    assert isinstance(resultado_global, dict), "El resultado debe ser un diccionario"

    for clave, valor in resultado_global.items():
        assert isinstance(valor, float), f"{clave} debe ser float, no {type(valor)}"
        assert valor >= 0.0, f"{clave} debe ser no negativo"

    # Con filtrado por instrumentos
    instrumentos = ["Piano", "Violin"]
    resultado_filtrado = analizar_mixtas(midi_path, instrumentos_seleccionados=instrumentos)
    assert isinstance(resultado_filtrado, dict), "El resultado filtrado debe ser un diccionario"

    for clave, valor in resultado_filtrado.items():
        assert isinstance(valor, float), f"{clave} (filtrado) debe ser float"
        assert valor >= 0.0, f"{clave} (filtrado) debe ser no negativo"

    print("✅ Test de métricas mixtas completado con éxito")