import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./CourseDetails.css";
import { HeaderCourse } from "../../components";
import { fetchCourseById } from "../../services/courses";

function CourseDetails() {
  const { id } = useParams();
  const [cursoAtual, setCursoAtual] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseById(id)
      .then(setCursoAtual)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (cursoAtual) {
      document.title = `Prepara IF - ${cursoAtual.course.name}`;
    }
  }, [cursoAtual]);

  if (loading) {
    return (
      <div className="course-details-page">
        <p>Carregando curso...</p>
      </div>
    );
  }

  if (!cursoAtual) {
    return (
      <div className="course-details-page">
        <p>Curso não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="course-details-page">
      <HeaderCourse
        title={cursoAtual.course.name}
        image={cursoAtual.course.image}
      />

      <main className="details-body">
        <aside className="details-sidebar">
          <div className="social-share">
            <span className="social-title">Compartilhe nas redes</span>
            <div className="social-icons">
              <div className="icon-circle">X</div>
              <div className="icon-circle">W</div>
              <div className="icon-circle">@</div>
            </div>
          </div>

          <div className="edicts-box">
            <h3 className="edicts-box-title">Editais Anteriores</h3>
            <ul className="edicts-list">
              {(cursoAtual.course.editals || []).map((edict, index) => (
                <li key={index}>{edict.title}</li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="details-description">
          <div className="course-description-text">
            {cursoAtual.course.description}
          </div>

          <div className="course-specs">
            <p>
              <strong>Modalidade:</strong> {cursoAtual.course.specs.modalidade}
            </p>
            <p>
              <strong>Duração:</strong> {cursoAtual.course.specs.duracao}
            </p>
            <p>
              <strong>Título concedido:</strong> {cursoAtual.course.specs.titulo}
            </p>
            <p>
              <strong>Turno:</strong> {cursoAtual.course.specs.turno}
            </p>
            <p>
              <strong>Campus:</strong> {cursoAtual.course.specs.campus}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CourseDetails;