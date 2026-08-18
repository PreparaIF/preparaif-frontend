import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import './AuthModal.css';

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register } = useAuth();

  const isOpen = Boolean(isAuthModalOpen);
  const mode = authModalMode || 'login';

  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTab(mode);
      setError('');
      setTimeout(() => emailInputRef.current?.focus(), 50);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAuthModal]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
        closeAuthModal();
      } else {
        await register(name, email, password);
        closeAuthModal();
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={closeAuthModal}
      role="presentation"
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button className="auth-modal-close" onClick={closeAuthModal} aria-label="Fechar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 id="auth-modal-title">{tab === 'login' ? 'Acessar Conta' : 'Criar sua Conta'}</h2>
          <p className="auth-modal-subtitle">
            {tab === 'login'
              ? 'Entre para acompanhar seu desempenho nas provas do IFAL.'
              : 'Cadastre-se para registrar sua evolução e salvar seu histórico.'}
          </p>
        </div>

        <div className="auth-modal-tabs">
          <button
            type="button"
            className={`auth-modal-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
            aria-selected={tab === 'login'}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`auth-modal-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
            aria-selected={tab === 'register'}
          >
            Criar Conta
          </button>
        </div>

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="auth-modal-input-wrapper">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                className="auth-modal-input"
                placeholder="Seu nome"
                aria-label="Nome completo"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-modal-input-wrapper">
            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input
              type="email"
              ref={emailInputRef}
              className="auth-modal-input"
              placeholder="Seu e-mail"
              aria-label="E-mail"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-modal-input-wrapper">
            <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type="password"
              className="auth-modal-input"
              placeholder="Sua senha"
              aria-label="Senha"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              minLength={tab === 'register' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="auth-modal-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-modal-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : tab === 'login' ? (
              'Entrar na Conta'
            ) : (
              'Cadastrar e Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
