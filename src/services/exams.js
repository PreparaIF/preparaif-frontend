const API_URL = import.meta.env.VITE_API_URL;

export async function fetchExams() {
  const response = await fetch(`${API_URL}/api/exame`);

  if (!response.ok) throw new Error("Erro ao buscar exame");

  const data = await response.json();

  return data?.map((q) => ({
    id: q.id,
    title: q.title,
    questions: q.questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: (question.options || []).map((option) => ({
        id: option.id,
        option: option.option,
        isCorrect: option.isCorrect,
      })),
    })),
  }));
}
