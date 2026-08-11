export function normalizeText(str) {
  if (!str) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function stripHtml(html) {
  if (!html) return "";
  return String(html).replace(/<[^>]*>?/gm, " ");
}

export function matchesSearch(targetText, searchTerm) {
  if (!searchTerm || !searchTerm.trim()) return true;
  const term = normalizeText(searchTerm);
  const text = normalizeText(stripHtml(targetText));
  return text.includes(term);
}

export function matchCourse(c, searchTerm) {
  const term = normalizeText(searchTerm);
  if (!term) return true;
  const searchableText = normalizeText(
    [
      c.course?.name,
      c.course?.description,
      c.institute?.name,
      c.course?.campus,
      c.course?.turno,
      c.course?.tipo,
      c.course?.specs?.modalidade,
      c.course?.specs?.titulo,
    ]
      .filter(Boolean)
      .join(" ")
  );
  return searchableText.includes(term);
}

export function matchEdital(edital, searchTerm) {
  const term = normalizeText(searchTerm);
  if (!term) return true;
  const searchableText = normalizeText(
    [
      edital.title,
      edital.description,
      stripHtml(edital.content),
      edital.time,
    ]
      .filter(Boolean)
      .join(" ")
  );
  return searchableText.includes(term);
}

export function matchExam(exam, searchTerm) {
  const term = normalizeText(searchTerm);
  if (!term) return true;

  const titleText = normalizeText(exam.title);
  if (titleText.includes(term)) return true;

  if (exam.questions && Array.isArray(exam.questions)) {
    return exam.questions.some((q) => {
      const questionText = normalizeText(q.text);
      if (questionText.includes(term)) return true;

      if (q.options && Array.isArray(q.options)) {
        return q.options.some((opt) => normalizeText(opt).includes(term));
      }
      return false;
    });
  }

  return false;
}
