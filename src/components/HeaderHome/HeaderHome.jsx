import { useNavigate } from "react-router-dom";
import "./HeaderHome.css";

export default function HeaderHome({ searchTerm, onSearchChange }) {
  const navigate = useNavigate();

  return (
    <div className="header-container">
      <div className="header-top-bar">
        <button
          className="admin-nav-button"
          onClick={() => navigate("/admin")}
          title="Acessar Painel do Administrador"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Painel Admin</span>
        </button>
      </div>

      <div className="hero-banner">
        <p className="hero-subtitle">
          A NOSSA FERRAMENTA NÃO TEM FINS LUCRATIVOS
        </p>
        <h1 className="hero-title">
          Seja Bem-vindo ao único{" "}
          <span className="highlight-green">site institucional</span> que{" "}
        </h1>
        <h1 className="hero-title">
          vai levar ao <span className="highlight-green">mais próximo</span> da
          sua aprovação!
        </h1>
      </div>
      <div className="search-container">
        <svg
          className="search-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Pesquisar curso..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
