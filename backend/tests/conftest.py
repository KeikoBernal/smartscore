import pytest
import os
import shutil

@pytest.fixture
def preparar_archivo_en_data_uploads():
    def _copiar(nombre_archivo):
        ruta_fixture = os.path.abspath(os.path.join(os.path.dirname(__file__), "fixture", nombre_archivo))
        ruta_destino = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "uploads", nombre_archivo))
        os.makedirs(os.path.dirname(ruta_destino), exist_ok=True)
        shutil.copy(ruta_fixture, ruta_destino)
    return _copiar