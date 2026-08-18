import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit } from "lucide-react";
import { fetchExams } from "../../services/exams";
import { useAuth } from "../../contexts/auth-context";
import LoadingSpinner from "../Utils/LoadingSpinner";
import { matchExam } from "../../utils/searchUtils";
import "./ExamsStyle.css";

export default function ExamsList({ searchTerm = "" }) {
  const navigate = useNavigate();
  const { user, openAuthModal, isAdmin } = useAuth();
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
      <div className="exams-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="exams-section-title">Provas Anteriores</h2>
        {isAdmin && (
          <button
            type="button"
            className="admin-add-element-btn"
            onClick={() => navigate('/admin?tab=prova')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#00875F', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            <Plus size={16} /> Adicionar Prova
          </button>
        )}
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
                <span className="exam-badge">{exam.examType || "Exame Anterior"}</span>
                <h3 className="exam-card-title">{exam.title}</h3>
                {exam.year && <span className="exam-card-year">{exam.year}</span>}
              </div>

              <div className="exam-card-actions">
                <span className="exam-questions-count">
                  {exam.questionCount ?? (exam.questions ? exam.questions.length : 0)} questões
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn-edit-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin?tab=prova&editId=${exam.id}`);
                      }}
                      title="Editar esta prova"
                      style={{ padding: '6px 10px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '12px' }}
                    >
                      <Edit size={14} /> Editar
                    </button>
                  )}
                  <button
                    className="btn-start-exam"
                    onClick={() => handleStartExamClick(exam.id)}
                  >
                    Fazer a prova
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
