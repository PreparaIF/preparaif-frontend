import { useNavigate } from 'react-router-dom';
import './CourseStyle.css';

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
      <rect width="800" height="400" fill="#F4F2E9"/>
      <g fill="none" stroke="#B4B2A9" stroke-width="3">
        <rect x="260" y="130" width="280" height="140" rx="10"/>
        <circle cx="330" cy="180" r="18"/>
        <path d="M260 250 L360 190 L440 230 L540 160 L540 270 L260 270 Z" fill="#B4B2A9" stroke="none"/>
      </g>
      <text x="400" y="330" font-family="sans-serif" font-size="18" fill="#888780" text-anchor="middle">Imagem indisponível</text>
    </svg>`
  );

const FALLBACK_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="32" fill="#E2E8DD"/>
      <text x="32" y="39" font-family="sans-serif" font-size="20" font-weight="bold" fill="#5C6B63" text-anchor="middle">IF</text>
    </svg>`
  );

export default function CourseCard({ institute, course }) {

    const navigate = useNavigate();

    const irParaCurso = () => {
        navigate('/curso');
    };

    return (
        <div className="course-container">
            <div className="course-image-wrapper">
                <img
                    className="course-image"
                    src={course.image || FALLBACK_IMAGE}
                    alt={course.name}
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                />
                {course.turno && <span className="course-badge">{course.turno}</span>}
            </div>

            <div className="course-body">
                <div className="institute">
                    <img
                        className="img-institute"
                        src={institute.logo || FALLBACK_LOGO}
                        alt={institute.name}
                        onError={(e) => { e.currentTarget.src = FALLBACK_LOGO; }}
                    />
                    <h2 className="institute-title">{institute.name}</h2>
                </div>

                <h2 className="course-title">{course.name}</h2>

                <div className="info-button">
                    <span className="course-info">Informações públicas no site da instituição</span>

                    <button className="course-button" onClick={irParaCurso}>
                        Ver curso
                    </button>
                </div>
            </div>
        </div>
    );
}