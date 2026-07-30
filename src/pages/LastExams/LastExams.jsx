import "./LastExams.css";
import { useNavigate } from "react-router-dom";

function LastExams() {
	const navigate = useNavigate();
	const examsList = [
		{
			id: 1,
			year: "2018",
			title: "Curso Técnico Integrado ao Ensino Médio",
			image:
				"https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=800&auto=format&fit=crop",
			thumb:
				"https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=200&auto=format&fit=crop",
			modality: "Presencial",
			duration: "30min",
		},
		{
			id: 2,
			year: "2019",
			title: "Curso Técnico Integrado ao Ensino Médio",
			image:
				"https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
			thumb:
				"https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=200&auto=format&fit=crop",
			modality: "Presencial",
			duration: "30min",
		},
		{
			id: 3,
			year: "2020",
			title: "Curso Técnico Integrado ao Ensino Médio",
			image:
				"https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=800&auto=format&fit=crop",
			thumb:
				"https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=200&auto=format&fit=crop",
			modality: "Presencial",
			duration: "30min",
		},
	];

	return (
		<div className="last-exams-page">
			<header className="last-exams-header">
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
				<h1 className="last-exams-page-title">Provas Anteriores</h1>
			</header>

			<div className="exams-carousel-container">
				{examsList.map((exam) => (
					<div className="last-exam-card" key={exam.id}>
						<div className="exam-card-cover">
							<img
								src={exam.image}
								alt={`Capa da prova ${exam.year}`}
								className="cover-img"
							/>

							<div className="cover-text-overlay">
								<span className="cover-subtitle">Exame Anterior</span>
								<h3 className="cover-title">{exam.title}</h3>
							</div>

							<span className="exam-year-badge">{exam.year}</span>
						</div>

						<div className="exam-card-footer">
							<img src={exam.thumb} alt="Miniatura" className="footer-thumb" />

							<div className="footer-info-group">
								<div className="info-block">
									<span className="info-value">{exam.modality}</span>
									<span className="info-label">Modalidade</span>
								</div>
								<div className="info-block">
									<span className="info-value">{exam.duration}</span>
									<span className="info-label">Duração</span>
								</div>
							</div>

							<button
								className="btn-fazer-prova"
								onClick={() => navigate("/exame")}
							>
								Fazer a prova
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default LastExams;
