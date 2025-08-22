import os
import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app

@pytest.mark.asyncio
async def test_mixtas_endpoint_valida_esquema_con_fixture(preparar_archivo_en_data_uploads):
    nombre_archivo = "coriolan.mid"
    preparar_archivo_en_data_uploads(nombre_archivo)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get(f"/mixtas/{nombre_archivo}")
        assert response.status_code == 200
        data = response.json()
        assert "archivo" in data
        assert "instrumentos" in data
        assert "mixtas" in data