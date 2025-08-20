import sys
import os
import json
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services")))
from mixtas_parser import analizar_mixtas

def mostrar_resultados(nombre, resultados):
    print(f"\n🎼 Resultados para: {nombre}")
    for clave, valor in resultados.items():
        print(f"  - {clave}: {valor:.4f}")

def test_metricas_coriolan():
    midi_path = os.path.join(os.path.dirname(__file__), "fixtures", "coriolan.mid")
    assert os.path.exists(midi_path), "⚠️ Archivo coriolan.mid no encontrado en fixtures"

    # Orquesta completa
    resultados_orquesta = analizar_mixtas(midi_path)
    mostrar_resultados("Orquesta completa", resultados_orquesta)

    # Solo violines
    resultados_violines = analizar_mixtas(midi_path, instrumentos_seleccionados=["Violin", "Violín"])
    mostrar_resultados("Violines solamente", resultados_violines)

    # Validaciones básicas
    assert isinstance(resultados_orquesta, dict)
    assert isinstance(resultados_violines, dict)
    assert len(resultados_orquesta) == len(resultados_violines), "⚠️ Cantidad de métricas inconsistente"

    print("\n✅ Métricas calculadas correctamente para coriolan.mid")