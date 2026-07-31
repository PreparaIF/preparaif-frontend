const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Helper genérico para requisições GET à API.
 * Centraliza a base URL e o tratamento de erros HTTP.
 */
export async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: falha ao buscar ${path}`);
  }

  return response.json();
}
