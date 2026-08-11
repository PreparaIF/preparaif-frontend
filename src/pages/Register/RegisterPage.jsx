import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../Login/LoginPage.css"; // Reaproveita os estilos do Login

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(name, email, password);
      navigate("/provas");
    } catch (err) {
      setError(err.message || "Erro ao fazer cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon-wrapper">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <h1 className="login-title">Crie sua Conta</h1>
        <p className="login-subtitle">Acompanhe seu desempenho nas provas do IFAL.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-wrapper">
            <svg className="login-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              type="text"
              className="login-input"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              autoFocus
              required
            />
          </div>

          <div className="login-input-wrapper">
            <svg className="login-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              className="login-input"
              placeholder="E-mail"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
            />
          </div>

          <div className="login-input-wrapper">
            <svg className="login-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              className="login-input"
              placeholder="Senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
            />
          </div>

          {error && (
            <div className="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading || !password || !email || !name}>
            {loading ? (
              <><span className="login-spinner" /> Registrando...</>
            ) : (
              "Cadastrar-se"
            )}
          </button>
        </form>
        
        <p className="login-register-prompt">
          Já tem uma conta? <Link to="/login" className="login-register-link">Faça login</Link>
        </p>

        <button className="login-back" onClick={() => navigate("/")}>
          ← Voltar para o início
        </button>
      </div>
    </div>
  );
}
