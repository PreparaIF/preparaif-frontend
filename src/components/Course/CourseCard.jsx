import { useNavigate } from "react-router-dom";
import "./CourseStyle.css";

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

export default function CourseCard({ id, institute, course }) {
    const navigate = useNavigate();

    const instData = institute || {};
    const courseData = course || {};

    return (
        <div className="course-card">
            <div className="course-image-wrapper">
                <img
                    className="course-image"
                    src={courseData.image || FALLBACK_IMAGE}
                    alt={courseData.name || "Curso"}
                    onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                />
                {courseData.turno && <span className="course-badge">{courseData.turno}</span>}
            </div>

            <div className="course-body">
                <div className="institute">
                    <img
                        className="img-institute"
                        src={instData.logo || FALLBACK_LOGO}
                        alt={instData.name || "Instituto"}
                        onError={(e) => {
                            e.currentTarget.src = FALLBACK_LOGO;
                        }}
                    />
                    <h2 className="institute-title">{instData.name || "Instituto Federal"}</h2>
                </div>

                <h2 className="course-title">{courseData.name || "Curso Técnico"}</h2>

                <div className="info-button">
                    <span className="course-info">
                        Informações públicas no site da instituição
                    </span>
                    <button
                        className="course-button"
                        onClick={() => navigate(`/curso/${id}`)}
                    >
                        Ver curso
                    </button>
                </div>
            </div>
        </div>
    );
}