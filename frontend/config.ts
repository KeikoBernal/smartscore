/**
 * URL base para llamadas al backend FastAPI.
 * Se define en `.env.local` como NEXT_PUBLIC_API_URL.
 * Este valor se expone al cliente porque comienza con NEXT_PUBLIC_.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"