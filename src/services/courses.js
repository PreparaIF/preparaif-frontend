const API_URL = import.meta.env.VITE_API_URL;

export async function fetchCourses() {
  const response = await fetch(`${API_URL}/api/cursos`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar cursos (${response.status})`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    instituteName: c.instituteName,
    instituteLogo: c.instituteLogo,
    image: c.image,
    readTime: c.readTime,
    modality: c.modality,
    duration: c.duration,
    degree: c.degree,
    shift: c.shift,
    campus: c.campus,
    editals: (c.editals || []).map((e) => ({
      id: e?.id,
      title: e?.title,
      description: e?.description,
      time: e?.time,
    })),
  }));
}

export async function fetchCourseById(id) {
  const response = await fetch(`${API_URL}/api/cursos/${id}`);

  if (!response.ok) {
    throw new Error(`Erro ao buscar o curso (${response.status})`);
  }

  const data = await response.json();
  return data;
}
