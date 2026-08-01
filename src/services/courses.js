import { apiGet } from "./api";

let coursesCache = null;

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

export async function fetchCourses(forceRefresh = false) {
  if (coursesCache && !forceRefresh) {
    return coursesCache;
  }
  const data = await apiGet("/courses");
  coursesCache = data.map(mapCourse);
  return coursesCache;
}

export async function fetchCourseById(id) {
  if (coursesCache) {
    const found = coursesCache.find((c) => String(c.id) === String(id));
    if (found) return found;
  }
  const data = await apiGet(`/courses/${id}`);
  return mapCourse(data);
}

export function clearCoursesCache() {
  coursesCache = null;
}