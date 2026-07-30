const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchEditais() {
  const response = await fetch(`${API_URL}/editais`);
  if (!response.ok) throw new Error("Erro ao buscar editais");
  const data = await response.json();

  return data.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.content,
    time: e.time
  }));
}