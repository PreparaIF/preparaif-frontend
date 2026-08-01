import { useState, useEffect, useMemo } from "react";
import { fetchCourses } from "../../services/courses";
import CourseCard from "./CourseCard";
import LoadingSpinner from "../Utils/LoadingSpinner";
import "./CourseStyle.css";

const PAGE_SIZE = 6;

function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function CoursesList({ searchTerm = "" }) {
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
    const matchesSearch = normalize(c.course.name).includes(normalize(searchTerm));
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

  return (
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
  );
}