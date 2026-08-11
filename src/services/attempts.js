import { apiFetch } from "./api";

export async function apiSaveAttempt(token, data) {
  return await apiFetch("/attempts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function apiGetMyAttempts(token) {
  return await apiFetch("/attempts/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Para admin
export async function apiGetAllAttempts(token) {
  return await apiFetch("/attempts/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function apiGetStudentAttempts(token, userId) {
  return await apiFetch(`/attempts/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
