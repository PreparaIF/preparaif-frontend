import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export async function fetchPreferences() {
  return await apiGet("/api/preferences");
}

export async function createPreference(data) {
  return await apiPost("/api/preferences", data);
}

export async function updatePreference(id, data) {
  return await apiPut(`/api/preferences/${id}`, data);
}

export async function deletePreference(id) {
  return await apiDelete(`/api/preferences/${id}`);
}
