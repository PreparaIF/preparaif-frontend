const API_URL = import.meta.env.VITE_API_URL;

export async function fetchEditais() {
  const response = await fetch(`${API_URL}/api/editais`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar editais (${response.status})`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    time: e.time || e.createdAt,
    content: e.content,
    instituteName: e.instituteName,
    instituteLogo: e.instituteLogo,
  }));
}

export async function fetchEditalById(id) {
  const response = await fetch(`${API_URL}/api/editais/${id}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar o edital (${response.status})`);
  }

  const data = await response.json();
  return data;
}
