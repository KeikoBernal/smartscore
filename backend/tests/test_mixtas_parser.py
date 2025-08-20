import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services")))
from mixtas_parser import analizar_mixtas

def test_analizar_mixtas_completo():
    # Ruta de prueba
    midi_path = os.path.join(os.path.dirname(__file__), "fixtures", "ejemplo.mid")
    assert os.path.exists(midi_path), "⚠️ Archivo MIDI de prueba no encontrado"

    # Métricas esperadas
    claves_esperadas = {
        "promedio_notas_por_compas",
        "varianza_notas_por_compas",
        "promedio_rango_dinamico",
        "densidad_armonica",
        "variabilidad_intervalica",
        "entropia_duracion",
        "sincronizacion_entrada",
        "dispersión_temporal",
        "compacidad_melodica",
        "repetitividad_motívica",
        "entropia_melodica",
        "entropia_ritmica",
        "entropia_armonica",
        "entropia_compuesta"
    }

    # Sin filtrado
    resultado_global = analizar_mixtas(midi_path)
    assert isinstance(resultado_global, dict), "El resultado debe ser un diccionario"
    assert claves_esperadas.issubset(resultado_global.keys()), "Faltan métricas en el resultado global"

    for clave in claves_esperadas:
        valor = resultado_global[clave]
        assert isinstance(valor, float), f"{clave} debe ser float, no {type(valor)}"
        assert valor >= 0.0, f"{clave} debe ser no negativo"

    # Con filtrado por instrumentos
    instrumentos = ["Piano", "Violin"]
    resultado_filtrado = analizar_mixtas(midi_path, instrumentos_seleccionados=instrumentos)
    assert isinstance(resultado_filtrado, dict), "El resultado filtrado debe ser un diccionario"
    assert claves_esperadas.issubset(resultado_filtrado.keys()), "Faltan métricas en el resultado filtrado"

    for clave in claves_esperadas:
        valor = resultado_filtrado[clave]
        assert isinstance(valor, float), f"{clave} (filtrado) debe ser float"
        assert valor >= 0.0, f"{clave} (filtrado) debe ser no negativo"

    print("✅ Test de métricas mixtas completado con éxito")