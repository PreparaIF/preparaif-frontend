import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchExams } from "../../services/exams";
import { ButtonVoltar } from "../../components";
import "./LastExams.css";

function LastExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.title = "Prepara IF - Provas Anteriores";
  }, []);

  return (
    <div className="last-exams-page">
      <header className="last-exams-header">
        <ButtonVoltar />
        <h1 className="last-exams-page-title">Provas Anteriores</h1>
      </header>

      {loading && <p>Carregando provas...</p>}

      {!loading && exams.length === 0 && <p>Nenhuma prova encontrada.</p>}

      {!loading && exams.length > 0 && (
        <div className="exams-carousel-container">
          {exams.map((exam) => (
            <div className="last-exam-card" key={exam.id}>
              <div className="exam-card-cover">
                <div className="cover-text-overlay">
                  <span className="cover-subtitle">Exame Anterior</span>
                  <h3 className="cover-title">{exam.title}</h3>
                </div>
              </div>

              <div className="exam-card-footer">
                <div className="footer-info-group">
                  <div className="info-block">
                    <span className="info-value">
                      {exam.questions.length} questões
                    </span>
                    <span className="info-label">Total</span>
                  </div>
                </div>

                <button
                  className="btn-fazer-prova"
                  onClick={() => navigate(`/exame/${exam.id}`)}
                >
                  Fazer a prova
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LastExams;
