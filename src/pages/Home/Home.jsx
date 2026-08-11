import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HeaderHome,
  CoursesList,
  EditaisList,
  ExamsList,
  LoadingSpinner,
  CourseSkeletonGrid,
} from "../../components";
import { fetchCourses } from "../../services/courses";
import { fetchEditais } from "../../services/edital";
import { fetchExams } from "../../services/exams";
import { matchCourse, matchEdital, matchExam } from "../../utils/searchUtils";
import "./Home.css";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [coursesData, setCoursesData] = useState([]);
  const [editaisData, setEditaisData] = useState([]);
  const [examsData, setExamsData] = useState([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view");

  useEffect(() => {
    document.title = "Prepara IF - Início";
    Promise.all([fetchCourses(), fetchEditais(), fetchExams()])
      .then(([c, ed, ex]) => {
        setCoursesData(c || []);
        setEditaisData(ed || []);
        setExamsData(ex || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const isSearching = Boolean(searchTerm.trim());
  const showCursos = !view || view === "cursos";
  const showEditais = !view || view === "editais";
  const showProvas = view === "provas" || isSearching;

  const hasMatchingCourses = showCursos && coursesData.some((c) => matchCourse(c, searchTerm));
  const hasMatchingEditais = showEditais && editaisData.some((e) => matchEdital(e, searchTerm));
  const hasMatchingExams = showProvas && examsData.some((ex) => matchExam(ex, searchTerm));
  const hasAnyResult = hasMatchingCourses || hasMatchingEditais || hasMatchingExams;

  return (
    <div>
      <HeaderHome searchTerm={searchTerm} onSearchChange={setSearchTerm} activeView={view} />
      {loading ? (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <LoadingSpinner text="Carregando dados..." />
          <CourseSkeletonGrid count={3} />
        </div>
      ) : (
        <>
          {isSearching && !hasAnyResult ? (
            <div style={{ maxWidth: "1200px", margin: "60px auto", textAlign: "center", color: "var(--color-muted)", padding: "0 20px" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "16px", opacity: 0.5 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <h3 style={{ fontSize: "1.3rem", color: "var(--color-ink)", marginBottom: "8px", fontWeight: "600" }}>Nenhum resultado encontrado</h3>
              <p>Não encontramos nenhum curso, edital ou prova com o termo "{searchTerm}".</p>
            </div>
          ) : (
            <>
              {showCursos && <CoursesList searchTerm={searchTerm} />}

              {showProvas && <ExamsList searchTerm={searchTerm} />}

              {!view && !isSearching && (
                <div className="exams-quick-access">
                  <div className="exams-quick-access-inner">
                    <div className="exams-qa-text">
                      <h2 className="exams-qa-title">Treine com as provas reais do IFAL</h2>
                      <p className="exams-qa-desc">
                        Pratique com questões das edições anteriores e esteja ainda mais preparado para o processo seletivo.
                      </p>
                    </div>
                    <button
                      className="exams-qa-btn"
                      onClick={() => navigate("/provas")}
                    >
                      Ver todas as provas
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {showEditais && <EditaisList searchTerm={searchTerm} />}
            </>
          )}
        </>
      )}
    </div>
  );
}