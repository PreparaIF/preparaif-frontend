import { apiGet } from "./api";

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

export async function fetchExams() {
  const data = await apiGet("/exams");
  return data.map(mapExam);
}

export async function fetchExamById(id) {
  const data = await apiGet(`/exams/${id}`);
  return mapExam(data);
}
