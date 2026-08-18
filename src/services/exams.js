import { apiGet, apiPost, apiPut } from "./api";

let examsCache = null;

function mapExam(exam) {
  return {
    id: exam.id,
    title: exam.title,
    year: exam.year || null,
    examType: exam.examType || null,
    questionCount: exam.questionCount ?? exam.questions?.length ?? 0,
    questions: (exam.questions || []).map((q, idx) => {
      const imageUrls = [
        ...(Array.isArray(q.imageUrls) ? q.imageUrls : []),
        ...(Array.isArray(q.images) ? q.images : []),
        ...(Array.isArray(q.imagens) ? q.imagens : []),
      ].filter((url, imageIndex, all) => typeof url === "string" && url && all.indexOf(url) === imageIndex);
      const primaryImage = q.imageUrl || q.imagem_url || q.image || imageUrls[0] || "";
      if (primaryImage && !imageUrls.includes(primaryImage)) imageUrls.unshift(primaryImage);

      return {
        id: q.id,
        number: q.number || idx + 1,
        numero_questao: q.number || idx + 1,
        texto_apoio: q.supportText || q.texto_apoio || q.text_apoio || "",
        texto_de_apoio: q.supportText || q.texto_apoio || q.text_apoio || "",
        supportText: q.supportText || q.texto_apoio || q.text_apoio || "",
        imagem_url: primaryImage,
        imageUrl: primaryImage,
        imageUrls,
        images: imageUrls,
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
      };
    }),
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

export async function fetchAdminExams() {
  const data = await apiGet("/exams/admin/all");
  return Array.isArray(data) ? data.map(mapExam) : [];
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
