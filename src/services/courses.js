import { apiGet, apiPost, apiPut } from "./api";

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
      editals: c.editals,
      edicts: c.editals,
    },
  };
}

const FALLBACK_COURSES = [
  {
    id: 1,
    institute: { name: "IFAL - Campus Maceió", logo: "" },
    course: {
      name: "Técnico em Informática para Internet",
      readTime: "3 Anos",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
      description: "Formação técnica integrada para desenvolvimento de aplicações web, bancos de dados e programação moderna.",
      tipo: "Técnico Integrado",
      specs: {
        modalidade: "Presencial",
        duracao: "3 Anos",
        titulo: "Técnico em Informática",
        turno: "Matutino",
        campus: "Campus Maceió",
      },
      turno: "Matutino",
      campus: "Campus Maceió",
      editals: [],
    },
  },
  {
    id: 2,
    institute: { name: "IFAL - Campus Arapiraca", logo: "" },
    course: {
      name: "Técnico em Eletrotécnica",
      readTime: "2 Anos",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
      description: "Curso focado em instalações elétricas industriais, sistemas de energia e automação.",
      tipo: "Técnico Subsequente",
      specs: {
        modalidade: "Presencial",
        duracao: "2 Anos",
        titulo: "Técnico em Eletrotécnica",
        turno: "Noturno",
        campus: "Campus Arapiraca",
      },
      turno: "Noturno",
      campus: "Campus Arapiraca",
      editals: [],
    },
  },
  {
    id: 3,
    institute: { name: "IFAL - Campus Maceió", logo: "" },
    course: {
      name: "Bacharelado em Sistemas de Informação",
      readTime: "4 Anos",
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80",
      description: "Graduação em engenharia de software, gestão de TI, inteligência de dados e desenvolvimento de sistemas.",
      tipo: "Bacharelado",
      specs: {
        modalidade: "Presencial",
        duracao: "4 Anos",
        titulo: "Bacharel em Sistemas de Informação",
        turno: "Vespertino",
        campus: "Campus Maceió",
      },
      turno: "Vespertino",
      campus: "Campus Maceió",
      editals: [],
    },
  },
];

export async function fetchCourses(forceRefresh = false) {
  if (coursesCache && !forceRefresh) {
    return coursesCache;
  }
  try {
    const data = await apiGet("/courses");
    coursesCache = data.map(mapCourse);
    return coursesCache;
  } catch (err) {
    console.warn("Erro ao buscar cursos do backend, utilizando dados de demonstração:", err);
    coursesCache = FALLBACK_COURSES;
    return coursesCache;
  }
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

export async function saveCourse(coursePayload, isEdit = false, id = null) {
  clearCoursesCache();
  if (isEdit && id) {
    return await apiPut(`/courses/${id}`, coursePayload);
  }
  return await apiPost("/courses", coursePayload);
}