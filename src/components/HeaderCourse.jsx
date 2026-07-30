import "./HeaderCourse.css";
import { useNavigate } from 'react-router-dom';
function HeaderCourse({ title, image }) {
	const navigate = useNavigate();
	return (
		<div className="header-course">
			<header className="details-header">
				<div className="header-text-content">
          <button className="btn-voltar" onClick={() => navigate(-1)}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polyline points="15 18 9 12 15 6"></polyline>
						</svg>
						Voltar
					</button>
          <div className="header-text-content-inner">
            <span className="source-info">
						Informações extraídas do Portal do Ifal
					</span>
					<h1 className="course-main-title">{title}</h1>

					<p className="read-time-info">
						<span className="green-highlight">Informações sobre o curso</span> -
						4min de leitura
					</p>
          </div>
          <section></section>
				</div>

				<div className="header-image-content">
					<img
						src={image}
						alt="Sala de aula"
						className="course-featured-image"
					/>
				</div>
			</header>
		</div>
	);
}

export default HeaderCourse;
