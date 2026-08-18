import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import "./CourseDetails.css";
import { HeaderCourse } from "../../components";
import { fetchCourseById } from "../../services/courses";
import { fetchEditais } from "../../services/edital";
import { useAuth } from "../../contexts/auth-context";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [cursoAtual, setCursoAtual] = useState(null);
  const [relatedEditais, setRelatedEditais] = useState([]);
  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([fetchCourseById(id), fetchEditais()])
      .then(([courseData, allEditais]) => {
        setCursoAtual(courseData);

        const courseEdicts =
          courseData?.course?.editals || courseData?.course?.edicts || [];
        let matched = [];

        if (Array.isArray(courseEdicts) && courseEdicts.length > 0) {
          matched = courseEdicts.map((e) => {
            if (typeof e === "object" && e !== null) return e;
            const found = (allEditais || []).find(
              (ed) => String(ed.id) === String(e) || ed.title === String(e)
            );
            return found || { id: e, title: String(e) };
          });
        }

        if (
          matched.length === 0 &&
          Array.isArray(allEditais) &&
          allEditais.length > 0
        ) {
          const courseName = (courseData?.course?.name || "").toLowerCase();
          const courseCampus = (courseData?.course?.campus || "").toLowerCase();

          const filtered = allEditais.filter((ed) => {
            const edTitle = (ed.title || "").toLowerCase();
            const edDesc = (ed.description || "").toLowerCase();
            const edContent = (ed.content || "").toLowerCase();
            return (
              (courseName &&
                (edTitle.includes(courseName) ||
                  edDesc.includes(courseName) ||
                  edContent.includes(courseName))) ||
              (courseCampus &&
                (edTitle.includes(courseCampus) || edDesc.includes(courseCampus)))
            );
          });

          matched = filtered.length > 0 ? filtered : [allEditais[0]];
        }

        setRelatedEditais(matched);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (cursoAtual) {
      document.title = `Prepara IF - ${cursoAtual.course.name}`;
    }
  }, [cursoAtual]);

  const shareText = `Confira o curso "${cursoAtual?.course?.name || ""}" no Prepara IF:`;
  const shareUrl = window.location.href;

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
      {isAdmin && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 16px', padding: '16px 20px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="admin-edit-element-btn"
            onClick={() => navigate(`/admin?tab=curso&editId=${id}`)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#00875F', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            <Edit size={16} /> Editar Este Curso
          </button>
        </div>
      )}
      <HeaderCourse
        title={cursoAtual.course.name}
        image={cursoAtual.course.image}
      />

      <main className="details-body">
        <aside className="details-sidebar">
          <div className="social-share">
            <span className="social-title">Compartilhe nas redes</span>
            <div className="social-icons">
              <button
                type="button"
                className="icon-circle whatsapp"
                title="Compartilhar no WhatsApp"
                aria-label="Compartilhar no WhatsApp"
                onClick={shareWhatsApp}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2a10 10 0 0 0-8.526 15.228L2 22l4.908-1.286A10 10 0 1 0 12 2zm0 18a7.95 7.95 0 0 1-4.053-1.106l-.29-.173-3.007.789.802-2.932-.19-.302A7.96 7.96 0 1 1 12 20z"/>
                </svg>
              </button>

              <button
                type="button"
                className="icon-circle twitter"
                title="Compartilhar no X (Twitter)"
                aria-label="Compartilhar no X (Twitter)"
                onClick={shareX}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>

              <button
                type="button"
                className="icon-circle facebook"
                title="Compartilhar no Facebook"
                aria-label="Compartilhar no Facebook"
                onClick={shareFacebook}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              <button
                type="button"
                className="icon-circle copy"
                title="Copiar link"
                aria-label="Copiar link"
                onClick={copyLink}
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                )}
              </button>
            </div>
            {copied && <span className="copied-toast">Link copiado!</span>}
          </div>

          <div className="edicts-box">
            <h3 className="edicts-box-title">Editais Relacionados</h3>
            <ul className="edicts-list">
              {relatedEditais.map((edict, index) => (
                <li
                  key={edict.id || index}
                  className="edict-item"
                  onClick={() => edict.id && navigate(`/edital/${edict.id}`)}
                  title={`Ver edital: ${edict.title}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="edict-icon"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span className="edict-title-text">{edict.title}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="edict-arrow"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </li>
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