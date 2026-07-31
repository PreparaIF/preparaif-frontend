import { apiGet } from "./api";

function detectTipo(title) {
  const lower = title.toLowerCase();
  if (lower.includes("bacharelado")) return "Bacharelado";
  if (lower.includes("licenciatura")) return "Licenciatura";
  if (lower.includes("tecnólogo") || lower.includes("tecnologo")) return "Tecnólogo";
  return "Outro";
}

function mapCourse(c) {
  return {
    id: c.id,
    institute: {
      name: c.instituteName,
      logo: c.instituteLogo,
    },
    course: {
      name: c.title,
      readTime: c.readTime,
      image: c.image,
      description: c.description,
      tipo: detectTipo(c.title),
      specs: {
        modalidade: c.modality,
        duracao: c.duration,
        titulo: c.degree,
        turno: c.shift,
        campus: c.campus,
      },
      turno: c.shift,
      campus: c.campus,
      edicts: c.editals,
    },
  };
}

export async function fetchCourses() {
  const data = await apiGet("/courses");
  return data.map(mapCourse);
}

export async function fetchCourseById(id) {
  const data = await apiGet(`/courses/${id}`);
  return mapCourse(data);
}