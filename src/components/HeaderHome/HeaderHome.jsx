import { Crown, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import "./HeaderHome.css";

export default function HeaderHome({ searchTerm, onSearchChange, activeView }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userEvolution, openAuthModal, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isAdminMode = isAdmin || location.pathname.startsWith('/admin') || activeView === 'admin';

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="header-container">
      <div className="header-top-bar">
        <div className="nav-menu-wrapper" ref={menuRef}>
          <button
            className="menu-nav-button"
            onClick={() => setMenuOpen((prev) => !prev)}
            title="Abrir menu de navegação"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span>Menu</span>
            <svg
              className={`menu-chevron ${menuOpen ? "open" : ""}`}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {menuOpen && (
            <div className="nav-dropdown">
              <button
                className={`nav-dropdown-item ${!activeView ? 'active' : ''}`}
                onClick={() => { setMenuOpen(false); navigate("/"); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Início</span>
              </button>

              <div className="nav-dropdown-divider" />

              <p className="nav-dropdown-label">Explorar</p>

              <button
                className={`nav-dropdown-item ${activeView === 'cursos' ? 'active' : ''}`}
                onClick={() => { setMenuOpen(false); navigate("/cursos"); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Todos os cursos</span>
              </button>

              <button
                className={`nav-dropdown-item ${activeView === 'provas' ? 'active' : ''}`}
                onClick={() => { setMenuOpen(false); navigate("/provas"); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9h6M9 13h6M9 17h4" />
                </svg>
                <span>Todas as provas</span>
              </button>

              <button
                className={`nav-dropdown-item ${activeView === 'editais' ? 'active' : ''}`}
                onClick={() => { setMenuOpen(false); navigate("/editais"); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Todos os editais</span>
              </button>

              <div className="nav-dropdown-divider" />

              {user ? (
                <>
                  <div
                    className="user-dropdown-profile-item clickable"
                    onClick={() => { setMenuOpen(false); navigate("/perfil"); }}
                    title="Clique para ver e editar seu perfil"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setMenuOpen(false);
                        navigate("/perfil");
                      }
                    }}
                  >
                    <div className="user-avatar-circle">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        isAdmin ? <Crown size={18} color="#FFD700" /> : userInitial
                      )}
                    </div>
                    <div className="user-profile-info">
                      <span className="user-profile-name">{user.name || (isAdmin ? 'Administrador' : 'Estudante')}</span>
                      {isAdmin ? (
                        <span
                          className="user-evolution-badge admin-badge"
                          style={{
                            color: "#065f46",
                            background: "#ecfdf5",
                            borderColor: "#a7f3d0",
                          }}
                        >
                          Administrador
                        </span>
                      ) : (
                        <span
                          className="user-evolution-badge"
                          style={{
                            color: userEvolution.badgeColor,
                            background: userEvolution.badgeBg,
                            borderColor: userEvolution.badgeBorder,
                          }}
                        >
                          {userEvolution.badge} {userEvolution.count > 0 ? `(${userEvolution.average}%)` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      className="nav-dropdown-item"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/admin");
                      }}
                      style={{ color: '#00875F', fontWeight: 'bold' }}
                    >
                      <ShieldCheck size={16} color="#00875F" />
                      <span>Painel do Administrador</span>
                    </button>
                  )}

                  <div className="nav-dropdown-divider" />

                  <button
                    className="nav-dropdown-item logout-item"
                    onClick={() => { setMenuOpen(false); logout(); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sair da conta</span>
                  </button>
                </>
              ) : (
                <button
                  className="nav-dropdown-item active"
                  onClick={() => { setMenuOpen(false); openAuthModal('login'); }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Entrar / Cadastrar</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hero-banner">
        <p className="hero-subtitle">
          {isAdminMode ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#00875F" style={{ verticalAlign: 'middle' }} /> MODO ADMINISTRADOR DO SISTEMA
            </span>
          ) : (
            'A NOSSA FERRAMENTA NÃO TEM FINS LUCRATIVOS'
          )}
        </p>
        <h1 className="hero-title">
          {isAdminMode ? (
            <>
              <span className="highlight-green">Painel de Controle</span> e <span className="highlight-green">Extração de Documentos</span> do IFAL
            </>
          ) : (
            <>
              Seja Bem-vindo ao único <span className="highlight-green">site institucional</span> que vai levar ao <span className="highlight-green">mais próximo</span> <br /> da sua aprovação!
            </>
          )}
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
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
