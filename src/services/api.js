const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

/**
 * Helper para requisições POST com JSON à API.
 */
export async function apiPost(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Erro ${response.status}`);
  }

  return response.json();
}

/**
 * Helper para upload de FormData(multipart) à API.
 */
export async function apiUpload(path, formData) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
    // Não setar Content-Type: o browser seta automaticamente com boundary
  });

  if (!response.ok) {
    let err = {};
    try { err = await response.json(); } catch (_e) { /* resposta sem corpo JSON */ } // eslint-disable-line no-unused-vars
    throw new Error(err.error || err.detail || `Erro ${response.status}`);
  }

  return response.json();
}
