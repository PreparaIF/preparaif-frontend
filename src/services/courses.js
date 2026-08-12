import { apiGet, apiPost, apiPut } from "./api";

let coursesCache = null;

function detectTipo(title = "") {
  const lower = String(title).toLowerCase();
  if (lower.includes("bacharelado")) return "Bacharelado";
  if (lower.includes("licenciatura")) return "Licenciatura";
  if (lower.includes("tecnólogo") || lower.includes("tecnologo")) return "Tecnólogo";
  return "Técnico";
}

function mapCourse(c) {
  return {
    id: c.id,
    institute: {
      name: c.instituteName || "IFAL",
      logo: c.instituteLogo || "",
    },
    course: {
      name: c.title || "Curso",
      readTime: c.readTime || "3 Anos",
      image: c.image || "",
      description: c.description || "",
      tipo: detectTipo(c.title),
      specs: {
        modalidade: c.modality || "Presencial",
        duracao: c.duration || "3 Anos",
        titulo: c.degree || "Técnico",
        turno: c.shift || "Matutino",
        campus: c.campus || "Maceió",
      },
      turno: c.shift || "Matutino",
      campus: c.campus || "Maceió",
      editals: c.editals || [],
      edicts: c.editals || [],
    },
  };
}

export async function fetchCourses(forceRefresh = false) {
  if (coursesCache && !forceRefresh) {
    return coursesCache;
  }
  const data = await apiGet("/courses");
  coursesCache = Array.isArray(data) ? data.map(mapCourse) : [];
  return coursesCache;
}

export async function fetchCourseById(id) {
  const data = await apiGet(`/courses/${id}`);
  return mapCourse(data);
}

export function clearCoursesCache() {
  coursesCache = null;
}

export async function saveCourse(coursePayload, isEdit = false, id = null) {
  clearCoursesCache();
  if (isEdit && id) {
    return await apiPut(`/courses/${id}`, coursePayload);
  }
  return await apiPost("/courses", coursePayload);
}