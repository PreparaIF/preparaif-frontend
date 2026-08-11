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
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiMe(token) {
  return await apiFetch("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
