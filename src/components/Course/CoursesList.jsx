import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { fetchCourses } from "../../services/courses";
import { useAuth } from "../../contexts/auth-context";
import CourseCard from "./CourseCard";
import LoadingSpinner from "../Utils/LoadingSpinner";
import { matchCourse } from "../../utils/searchUtils";
import "./CourseStyle.css";

const PAGE_SIZE = 6;

export default function CoursesList({ searchTerm = "" }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [turnoFilter, setTurnoFilter] = useState("");
  const [campusFilter, setCampusFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const turnos = useMemo(
    () => [...new Set(courses.map((c) => c.course.turno).filter(Boolean))],
    [courses]
  );
  const campuses = useMemo(
    () => [...new Set(courses.map((c) => c.course.campus).filter(Boolean))],
    [courses]
  );
  const tipos = useMemo(
    () => [...new Set(courses.map((c) => c.course.tipo).filter(Boolean))],
    [courses]
  );

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = matchCourse(c, searchTerm);
    const matchesTurno = !turnoFilter || c.course.turno === turnoFilter;
    const matchesCampus = !campusFilter || c.course.campus === campusFilter;
    const matchesTipo = !tipoFilter || c.course.tipo === tipoFilter;
    return matchesSearch && matchesTurno && matchesCampus && matchesTipo;
  });

  const visibleCourses = filteredCourses.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCourses.length;

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  if (loading) return <LoadingSpinner text="Carregando cursos..." />;

  const isSearching = Boolean(searchTerm.trim());
  if (isSearching && filteredCourses.length === 0) {
    return null;
  }

  return (
    <section className="courses-section">
      <div className="courses-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="courses-section-title">Cursos Disponíveis</h2>
        {isAdmin && (
          <button
            type="button"
            className="admin-add-element-btn"
            onClick={() => navigate('/admin?tab=curso')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#00875F', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            <Plus size={16} /> Adicionar Curso
          </button>
        )}
      </div>
      <>
        <div className="courses-filters">
        <select value={tipoFilter} onChange={handleFilterChange(setTipoFilter)}>
          <option value="">Todos os tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={turnoFilter} onChange={handleFilterChange(setTurnoFilter)}>
          <option value="">Todos os turnos</option>
          {turnos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={campusFilter} onChange={handleFilterChange(setCampusFilter)}>
          <option value="">Todos os campi</option>
          {campuses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="courses-container">
        {filteredCourses.length === 0 && (
          <p className="no-results">Nenhum curso foi encontrado.</p>
        )}
        {visibleCourses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            institute={course.institute}
            course={course.course}
          />
        ))}
      </div>

      {hasMore && (
        <div className="see-more-container">
          <button
            type="button"
            className="see-more-link"
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
          >
            Ver mais...
          </button>
        </div>
      )}
      </>
    </section>
  );
}