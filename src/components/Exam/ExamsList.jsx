import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchExams } from "../../services/exams";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../Utils/LoadingSpinner";
import { matchExam } from "../../utils/searchUtils";
import "./ExamsStyle.css";

export default function ExamsList({ searchTerm = "" }) {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredExams = exams.filter((exam) => matchExam(exam, searchTerm));

  const isSearching = Boolean(searchTerm.trim());
  if (isSearching && filteredExams.length === 0) {
    return null;
  }

  const handleStartExamClick = (examId) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    navigate(`/exame/${examId}`);
  };

  return (
    <section className="exams-section">
      <div className="exams-section-header">
        <h2 className="exams-section-title">Provas Anteriores</h2>
      </div>

      {loading && <LoadingSpinner text="Carregando provas anteriores..." />}

      {!loading && filteredExams.length === 0 && (
        <p className="exams-empty">Nenhuma prova foi encontrada.</p>
      )}

      {!loading && filteredExams.length > 0 && (
        <div className="exams-grid">
          {filteredExams.map((exam) => (
            <div className="exam-card-item" key={exam.id}>
              <div className="exam-card-header">
                <span className="exam-badge">Exame Anterior</span>
                <h3 className="exam-card-title">{exam.title}</h3>
                <span className="exam-card-meta">
                  Processo Seletivo do Instituto Federal
                </span>
              </div>

              <div className="exam-card-actions">
                <span className="exam-questions-count">
                  {exam.questions ? exam.questions.length : 0} questões
                </span>
                <button
                  className="btn-start-exam"
                  onClick={() => handleStartExamClick(exam.id)}
                >
                  Fazer a prova
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
