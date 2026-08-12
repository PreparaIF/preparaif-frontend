const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Erro ${response.status}`);
  }

  return response.json();
}

export const apiGet = apiFetch;

export async function apiPost(path, data) {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiPut(path, data) {
  return apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function apiDelete(path) {
  return apiFetch(path, {
    method: "DELETE",
  });
}

export async function apiUpload(path, formData) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || err.detail || `Erro ${response.status}`);
  }

  return response.json();
}
