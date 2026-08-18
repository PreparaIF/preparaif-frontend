const configuredApiUrl = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL_LOCAL)
  : import.meta.env.VITE_API_URL;

const API_URL = configuredApiUrl?.replace(/\/$/, "");
const TOKEN_KEY = "preparaif_token";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const defaultHeaders = {};

  if (!API_URL) {
    throw new Error(
      "A URL da API não está configurada para este ambiente."
    );
  }

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  if (options.body instanceof FormData) {
    delete mergedHeaders["Content-Type"];
    delete mergedHeaders["content-type"];
  }

  let cleanPath = path;
  if (API_URL.endsWith("/api") && cleanPath.startsWith("/api/")) {
    cleanPath = cleanPath.replace(/^\/api/, "");
  }

  const response = await fetch(`${API_URL}${cleanPath}`, {
    ...options,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = typeof err.error === "object" ? err.error?.message : err.error;
    throw new Error(message || err.detail || err.message || `Erro HTTP ${response.status}`);
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
