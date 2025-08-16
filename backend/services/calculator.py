from utils.music_tools import METRICAS

def compute_all_metrics(data):
    resultados = {}
    for categoria, funciones in METRICAS.items():
        resultados[categoria] = {}
        for nombre_metrica, funcion in funciones.items():
            try:
                resultados[categoria][nombre_metrica] = funcion(data)
            except Exception as e:
                resultados[categoria][nombre_metrica] = {"error": str(e)}
    return resultados