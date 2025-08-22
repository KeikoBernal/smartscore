import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Ajusta si usas Docker o IP externa
});

export const subirArchivo = (formData: FormData) =>
  api.post('/upload/', formData);

export const obtenerMetricasGlobales = (archivo: string) =>
  api.get(`/metrics/${archivo}`);

export const obtenerCompases = (archivo: string) =>
  api.get(`/compases/${archivo}`);

export const obtenerMixtas = (archivo: string) =>
  api.get(`/mixtas/${archivo}`);