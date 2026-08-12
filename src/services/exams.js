import { apiGet, apiPost, apiPut } from "./api";

let examsCache = null;

function mapExam(exam) {
  return {
    id: exam.id,
    title: exam.title,
    year: exam.year || null,
    examType: exam.examType || null,
    questions: (exam.questions || []).map((q, idx) => ({
      id: q.id,
      number: q.number || idx + 1,
      numero_questao: q.number || idx + 1,
      texto_apoio: q.supportText || q.texto_apoio || q.text_apoio || "",
      texto_de_apoio: q.supportText || q.texto_apoio || q.text_apoio || "",
      supportText: q.supportText || q.texto_apoio || q.text_apoio || "",
      imagem_url: q.imageUrl || q.imagem_url || q.image || "",
      imageUrl: q.imageUrl || q.imagem_url || q.image || "",
      creditos: q.credits || q.creditos || q.source || "",
      credits: q.credits || q.creditos || q.source || "",
      text: q.text || q.statement || "",
      enunciado: q.text || q.statement || "",
      statement: q.text || q.statement || "",
      options: Array.isArray(q.options) ? q.options : [],
      opcoes: Array.isArray(q.options) ? q.options : [],
      correctAnswerIndex: q.correctAnswerIndex ?? null,
      gabarito: q.correctAnswerIndex ?? null,
      status: q.status || (q.correctAnswerIndex !== null ? "VALID" : "UNKNOWN"),
    })),
  };
}

export async function fetchExams(forceRefresh = false) {
  if (examsCache && !forceRefresh) {
    return examsCache;
  }
  const data = await apiGet("/exams");
  examsCache = Array.isArray(data) ? data.map(mapExam) : [];
  return examsCache;
}

export async function fetchExamById(id) {
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
