import { apiFetch } from "./api";

export function calculateUserEvolution(attempts = []) {
  if (!attempts || attempts.length === 0) {
    return {
      level: "Primeiro Acesso",
      badge: "Primeiro Acesso",
      average: 0,
      count: 0,
      badgeColor: "#6b7280",
      badgeBg: "#f3f4f6",
      badgeBorder: "#e5e7eb",
    };
  }

  const totalPercentage = attempts.reduce((acc, curr) => {
    let pct = curr.percentage;
    if (pct === undefined || pct === null) {
      pct = Math.round(((curr.score || 0) / (curr.total || 1)) * 100);
    }
    return acc + pct;
  }, 0);

  const average = Math.round(totalPercentage / attempts.length);

  if (average >= 85) {
    return {
      level: "Avançado",
      badge: "Avançado",
      average,
      count: attempts.length,
      badgeColor: "#047857",
      badgeBg: "#d1fae5",
      badgeBorder: "#a7f3d0",
    };
  }

  if (average >= 60) {
    return {
      level: "Intermediário",
      badge: "Intermediário",
      average,
      count: attempts.length,
      badgeColor: "#1d4ed8",
      badgeBg: "#dbeafe",
      badgeBorder: "#bfdbfe",
    };
  }

  return {
    level: "Iniciante",
    badge: "Iniciante",
    average,
    count: attempts.length,
    badgeColor: "#b45309",
    badgeBg: "#fef3c7",
    badgeBorder: "#fde68a",
  };
}

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
