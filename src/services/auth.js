import { apiFetch } from "./api";

export async function apiLogin(email, password) {
  return await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(name, email, password) {
  return await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role: "STUDENT" }),
  });
}

export async function apiMe(token) {
  if (!token) throw new Error("Token não fornecido");

  return await apiFetch("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function apiUpdateProfile(token, profileData) {
  if (!token) throw new Error("Token não fornecido");

  return await apiFetch("/auth/me", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
}
