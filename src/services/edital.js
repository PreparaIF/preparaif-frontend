import { apiGet, apiPost, apiPut } from "./api";

let editaisCache = null;

function mapEdital(e) {
  return {
    id: e.id,
    title: e.title || "Edital sem título",
    description: e.description || "",
    content: e.content || "",
    time: e.time || "Avisos e Editais",
    courses: e.courses || [],
  };
}

export async function fetchEditais(forceRefresh = false) {
  if (editaisCache && !forceRefresh) {
    return editaisCache;
  }
  const data = await apiGet("/editals");
  editaisCache = Array.isArray(data) ? data.map(mapEdital) : [];
  return editaisCache;
}

export async function fetchEditalById(id) {
  const data = await apiGet(`/editals/${id}`);
  return mapEdital(data);
}

export function clearEditaisCache() {
  editaisCache = null;
}

export async function saveEdital(editalPayload, isEdit = false, id = null) {
  clearEditaisCache();
  if (isEdit && id) {
    return await apiPut(`/editals/${id}`, editalPayload);
  }
  return await apiPost("/editals", editalPayload);
}