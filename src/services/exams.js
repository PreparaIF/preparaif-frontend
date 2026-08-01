import { apiGet } from "./api";

let examsCache = null;

function mapExam(exam) {
  return {
    id: exam.id,
    title: exam.title,
    questions: exam.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
    })),
  };
}

export async function fetchExams(forceRefresh = false) {
  if (examsCache && !forceRefresh) {
    return examsCache;
  }
  const data = await apiGet("/exams");
  examsCache = data.map(mapExam);
  return examsCache;
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
