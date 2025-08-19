from services.compas_parser import analizar_compases

# Ruta relativa al archivo MIDI que subiste
resultado = analizar_compases("uploads/coriolan.mid")

# Imprimir cada compás analizado
for compas in resultado:
    print(compas)