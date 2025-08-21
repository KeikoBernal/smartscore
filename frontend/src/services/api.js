import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"; // Ajusta según tu backend

export const analizarArchivo = async (archivo) => {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await axios.post(`${BASE_URL}/api/analizar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};