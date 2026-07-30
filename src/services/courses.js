const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function detectTipo(title) {
  const lower = title.toLowerCase();
  if (lower.includes("bacharelado")) return "Bacharelado";
  if (lower.includes("licenciatura")) return "Licenciatura";
  if (lower.includes("tecnólogo") || lower.includes("tecnologo")) return "Tecnólogo";
  return "Outro";
}

export async function fetchCourses() {
  const response = await fetch(`${API_URL}/courses`);
  if (!response.ok) throw new Error("Erro ao buscar cursos");
  const data = await response.json();

  return data.map((c) => ({
    id: c.id,
    institute: {
      name: c.instituteName,
      logo: c.instituteLogo
    },
    course: {
      name: c.title,
      readTime: c.readTime,
      image: c.image,
      description: c.description,
      tipo: detectTipo(c.title),
      specs: {
        modalidade: c.modalidade,
        duracao: c.duracao,
        titulo: c.titulo,
        turno: c.turno,
        campus: c.campus
      },
      turno: c.turno,
      campus: c.campus,
      edicts: c.edicts
    }
  }));
}