import sys
import os
import pytest

# Agrega la raíz del proyecto al PYTHONPATH
sys.path.insert(0, os.path.abspath("."))

# Ejecuta pytest
pytest.main(["backend/tests", "--disable-warnings", "-v"])