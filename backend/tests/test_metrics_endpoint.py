import os
import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app

@pytest.mark.asyncio
async def test_metrics_endpoint_valida_esquema_con_fixture(preparar_archivo_en_data_uploads):
    nombre_archivo = "coriolan.mid"
    preparar_archivo_en_data_uploads(nombre_archivo)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(f"/metrics/{nombre_archivo}")
        assert response.status_code == 200
        data = response.json()
        for campo in [
            "archivo", "instrumentos", "duracion_segundos", "tempo_promedio",
            "entropia_melodica", "entropia_ritmica", "entropia_armonica",
            "entropia_interaccion", "complejidad_total", "firma_metrica",
            "progresiones_armonicas", "contrapunto_activo", "familias_instrumentales"
        ]:
            assert campo in data