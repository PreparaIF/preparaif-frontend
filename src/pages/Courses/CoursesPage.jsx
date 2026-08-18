import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { fetchCourses } from '../../services/courses';
import { useAuth } from '../../contexts/auth-context';
import CourseCard from '../../components/Course/CourseCard';
import ButtonVoltar from '../../components/Utils/ButtonVoltar';
import LoadingSpinner from '../../components/Utils/LoadingSpinner';
import './CoursesPage.css';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipoFilter, setTipoFilter] = useState('');
  const [turnoFilter, setTurnoFilter] = useState('');
  const [campusFilter, setCampusFilter] = useState('');

  useEffect(() => {
    document.title = 'Prepara IF - Cursos Disponíveis';
    fetchCourses()
      .then((data) => setCourses(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const tipos = useMemo(
    () => [...new Set(courses.map((c) => c.course?.tipo).filter(Boolean))],
    [courses]
  );
  const turnos = useMemo(
    () => [...new Set(courses.map((c) => c.course?.turno).filter(Boolean))],
    [courses]
  );
  const campuses = useMemo(
    () => [...new Set(courses.map((c) => c.course?.campus).filter(Boolean))],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesTipo = !tipoFilter || c.course?.tipo === tipoFilter;
      const matchesTurno = !turnoFilter || c.course?.turno === turnoFilter;
      const matchesCampus = !campusFilter || c.course?.campus === campusFilter;
      return matchesTipo && matchesTurno && matchesCampus;
    });
  }, [courses, tipoFilter, turnoFilter, campusFilter]);

  return (
    <div className="section-page-container">
      <div className="section-top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ButtonVoltar onClick={() => navigate('/')} />
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

      <div className="section-page-hero">
        <h1 className="section-page-title">Cursos Disponíveis</h1>
        <p className="section-page-subtitle">
          Explore as opções de cursos oferecidos pelos Institutos Federais filtrando por tipo, turno e campus.
        </p>
      </div>

      {/* Cards & Filters */}
      {loading ? (
        <LoadingSpinner text="Carregando cursos disponíveis..." />
      ) : (
        <>
          {/* Pill Filter Bar */}
          <div className="pill-filters-row">
            <select
              className="pill-filter-select"
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
            >
              <option value="">Todos os tipos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              className="pill-filter-select"
              value={turnoFilter}
              onChange={(e) => setTurnoFilter(e.target.value)}
            >
              <option value="">Todos os turnos</option>
              {turnos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              className="pill-filter-select"
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
            >
              <option value="">Todos os campi</option>
              {campuses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="section-cards-grid">
            {filteredCourses.length === 0 ? (
              <div className="section-empty-box">
                <p>Nenhum curso encontrado nesta categoria.</p>
              </div>
            ) : (
              filteredCourses.map((item) => (
                <CourseCard
                  key={item.id}
                  id={item.id}
                  institute={item.institute}
                  course={item.course}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
