const API_URL = import.meta.env.VITE_API_URL || "https://preparaif-api.onrender.com/api";
const TOKEN_KEY = "preparaif_token";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const defaultHeaders = {};

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Se o body for FormData, NÃO definir Content-Type para que o browser defina o multipart/form-data boundary
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  // Se por ventura o cabeçalho tiver passado Content-Type em FormData, removemos
  if (options.body instanceof FormData) {
    delete mergedHeaders["Content-Type"];
    delete mergedHeaders["content-type"];
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.detail || err.message || `Erro HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const apiGet = apiFetch;

export async function apiPost(path, data) {
  return apiFetch(path, {
    method: "POST",
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

export async function apiPut(path, data) {
  return apiFetch(path, {
    method: "PUT",
    body: data instanceof FormData ? data : JSON.stringify(data),
  });
}

export async function apiDelete(path) {
  return apiFetch(path, {
    method: "DELETE",
  });
}

export async function apiUpload(path, formData) {
  return apiFetch(path, {
    method: "POST",
    body: formData,
  });
}
