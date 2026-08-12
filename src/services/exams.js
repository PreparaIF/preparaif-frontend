import { apiGet, apiPost, apiPut } from "./api";

let examsCache = null;

function mapExam(exam) {
  return {
    id: exam.id,
    title: exam.title,
    questions: (exam.questions || []).map((q) => ({
      id: q.id,
      texto_apoio: q.texto_apoio || q.text_apoio || "",
      imagem_url: q.imagem_url || q.image || "",
      creditos: q.creditos || q.source || "",
      text: q.text || "",
      options: q.options || [],
      correctAnswerIndex: q.correctAnswerIndex ?? 0,
    })),
  };
}

const FALLBACK_EXAMS = [
  {
    id: 1,
    title: "Exame de Seleção 2025 - Ensino Técnico Integrado",
    questions: [
      {
        id: 101,
        text: "Qual é a principal função de um algoritmo em ciência da computação?",
        options: [
          "Definir a cor dos componentes da interface de usuário",
          "Fornecer uma sequência finita de instruções bem definidas para resolver um problema",
          "Formatar textos e tabelas em documentos impressos",
          "Executar diagnósticos de hardware no computador",
        ],
        correctAnswerIndex: 1,
      },
    ],
  },
  {
    id: 2,
    title: "Exame de Seleção 2024 - Ensino Superior (Sistemas)",
    questions: [
      {
        id: 201,
        text: "Em orientação a objetos, o conceito que permite a uma classe reutilizar atributos e métodos de outra classe é chamado de:",
        options: ["Polimorfismo", "Encapsulamento", "Herança", "Abstração"],
        correctAnswerIndex: 2,
      },
    ],
  },
];

export async function fetchExams(forceRefresh = false) {
  if (examsCache && !forceRefresh) {
    return examsCache;
  }
  try {
    const data = await apiGet("/exams");
    examsCache = data.map(mapExam);
    return examsCache;
  } catch (err) {
    console.warn("Erro ao buscar exames do backend, utilizando dados de demonstração:", err);
    examsCache = FALLBACK_EXAMS;
    return examsCache;
  }
}

export async function fetchExamById(id) {
  if (examsCache) {
    const found = examsCache.find((c) => String(c.id) === String(id));
    if (found) return found;
  }

  const data = await apiGet(`/exams/${id}`);
  return mapExam(data);
}

export function clearExamsCache() {
  examsCache = null;
}

export async function saveExam(examPayload, isEdit = false, id = null) {
  clearExamsCache();
  if (isEdit && id) {
    return await apiPut(`/exams/${id}`, examPayload);
  }
  return await apiPost("/exams", examPayload);
}
