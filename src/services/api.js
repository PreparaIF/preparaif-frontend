const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Erro ${response.status}: falha ao buscar ${path}`);
  }

  return response.json();
}

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

export async function apiUpload(path, formData) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let err = {};
    try { err = await response.json(); } catch { }
    throw new Error(err.error || err.detail || `Erro ${response.status}`);
  }

  return response.json();
}
