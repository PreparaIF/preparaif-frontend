import { apiGet } from "./api";

function mapEdital(e) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    content: e.content,
    time: e.time,
  };
}

export async function fetchEditais() {
  const data = await apiGet("/editals");
  return data.map(mapEdital);
}

export async function fetchEditalById(id) {
  const data = await apiGet(`/editals/${id}`);
  return mapEdital(data);
}