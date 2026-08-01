import { apiGet } from "./api";

let editaisCache = null;

function mapEdital(e) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    content: e.content,
    time: e.time,
  };
}

export async function fetchEditais(forceRefresh = false) {
  if (editaisCache && !forceRefresh) {
    return editaisCache;
  }
  const data = await apiGet("/editals");
  editaisCache = data.map(mapEdital);
  return editaisCache;
}

export async function fetchEditalById(id) {
  if (editaisCache) {
    const found = editaisCache.find((e) => String(e.id) === String(id));
    if (found) return found;
  }
  const data = await apiGet(`/editals/${id}`);
  return mapEdital(data);
}

export function clearEditaisCache() {
  editaisCache = null;
}