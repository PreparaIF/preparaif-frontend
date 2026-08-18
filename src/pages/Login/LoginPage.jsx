import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/provas");
      }
    } catch (err) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon-wrapper">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h1 className="login-title">Acesso à Plataforma</h1>
        <p className="login-subtitle">Faça login para salvar sua evolução ou acessar o painel.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-wrapper">
            <svg className="login-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              className="login-input"
              placeholder="E-mail"
              aria-label="E-mail"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              autoFocus
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
              aria-label="Senha"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              required
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading || !password || !email}>
            {loading ? (
              <><span className="login-spinner" /> Verificando...</>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        
        <p className="login-register-prompt">
          Não tem uma conta? <Link to="/cadastro" className="login-register-link">Cadastre-se</Link>
        </p>

        <button className="login-back" onClick={() => navigate("/")}>
          ← Voltar para o início
        </button>
      </div>
    </div>
  );
}
