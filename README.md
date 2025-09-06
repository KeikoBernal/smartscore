### 🎼 SmartScore — Análisis Matemático de Música Clásica

SmartScore es una herramienta computacional diseñada para analizar archivos MIDI desde una perspectiva matemática, con énfasis en estructuras musicales propias del repertorio clásico. Utiliza bibliotecas como `pretty_midi`, `music21` y `numpy` para extraer métricas que revelan simetrías, proporciones, transformaciones y patrones tonales.

---

## 🧠 Fundamento teórico

La música clásica occidental está profundamente ligada a estructuras matemáticas:

- **Intervalos como proporciones racionales** (Pitágoras): octava (2:1), quinta (3:2), cuarta (4:3)
- **Transformaciones melódicas** (Bach, Mozart): inversión, retrogradación, transposición
- **Topología de acordes** (Tymoczko): representación de progresiones como trayectorias en espacios tonales
- **Ritmo como secuencia modular**: compases modelados como grupos cíclicos

SmartScore traduce estas ideas en métricas computables a partir de archivos MIDI.

---

## 📦 Requisitos

- Python 3.11+
- Instalar dependencias:

cd backend
pip install -r requirements.txt


---

## 📊 Métricas calculadas

- **Distribución de intervalos**: análisis estadístico de saltos melódicos
- **Entropía rítmica**: medida de variabilidad temporal
- **Densidad armónica**: cantidad de eventos simultáneos por compás
- **Transformaciones temáticas**: detección de motivos invertidos o transpuestos
- **Perfil tonal**: histogramas de alturas y clases de pitch
- **Simetría estructural**: detección de patrones repetitivos

---

## ⚙️ Ejecución

python main.py --input path/to/file.mid --output outputs/result.json


> El script analiza el archivo MIDI y genera un archivo JSON con las métricas musicales.

---

## 🖥️ Integración con frontend

El frontend (React) puede leer el archivo JSON generado y graficar las métricas usando librerías como `Chart.js`, `Recharts` o `D3`.

---

## 📐 Ejemplo de análisis

Para el archivo `fuga_bach.mid`, SmartScore puede detectar:

- Predominio de intervalos de cuarta y quinta
- Simetría melódica por inversión
- Densidad armónica creciente en el desarrollo
- Perfil tonal centrado en D menor

---

## 📜 Licencia

MIT — libre para uso académico, educativo y profesional.

---

## ✨ Autoría

Desarrollado por Keiko, con precisión quirúrgica y pasión por la intersección entre música y matemáticas.
