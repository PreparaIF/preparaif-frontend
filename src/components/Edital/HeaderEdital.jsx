import { useNavigate } from "react-router-dom";
import "./EditalStyle.css";

function HeaderEdital({ title }) {
  const navigate = useNavigate();
  return (
    <div className="header-edital">
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

          <span className="source-info">
            Informações extraídas do Portal do Ifal
          </span>
          <h1 className="edital-main-title">{title}</h1>

          <p className="read-time-info">
            <span className="green-highlight">Informações sobre o edital</span>{" "}
            - 4min de leitura
          </p>
        </div>
      </header>
    </div>
  );
}

export default HeaderEdital;
