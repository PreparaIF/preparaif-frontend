const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchExam() {
  const response = await fetch(`${API_URL}/exams`);
  if (!response.ok) throw new Error("Erro ao buscar exame");
  const data = await response.json();

  if (!data.length) return null;

  const exam = data[0];
  return {
    id: exam.id,
    title: exam.title,
    questions: exam.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex
    }))
  };
}