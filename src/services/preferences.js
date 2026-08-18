import { apiGet, apiPost, apiPut, apiDelete } from "./api";

const DEFAULT_PREFERENCES = [
  { id: 1, label: "Tecnologia & Informática", category: "AREA", icon: "Laptop" },
  { id: 2, label: "Engenharia & Exatas", category: "AREA", icon: "Ruler" },
  { id: 3, label: "Ciências Biológicas & Saúde", category: "AREA", icon: "Activity" },
  { id: 4, label: "Gestão & Negócios", category: "AREA", icon: "Briefcase" },
  { id: 5, label: "Ensino Técnico", category: "MODALIDADE", icon: "Wrench" },
  { id: 6, label: "Bacharelado", category: "MODALIDADE", icon: "GraduationCap" },
  { id: 7, label: "Licenciatura", category: "MODALIDADE", icon: "BookOpen" },
  { id: 8, label: "Tecnólogo", category: "MODALIDADE", icon: "Cog" },
];

export async function fetchPreferences() {
  try {
    const res = await apiGet("/preferences");
    return Array.isArray(res) ? res : DEFAULT_PREFERENCES;
  } catch (err) {
    console.warn("⚠️ API de preferências indisponível (fallback utilizado):", err.message);
    return DEFAULT_PREFERENCES;
  }
}

export async function createPreference(data) {
  return await apiPost("/preferences", data);
}

export async function updatePreference(id, data) {
  return await apiPut(`/preferences/${id}`, data);
}

export async function deletePreference(id) {
  return await apiDelete(`/preferences/${id}`);
}
