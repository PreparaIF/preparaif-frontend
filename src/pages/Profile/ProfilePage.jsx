import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import ButtonVoltar from '../../components/Utils/ButtonVoltar';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAdmin, userEvolution, updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('dados');
  const [photoUrl, setPhotoUrl] = useState(user?.avatar || '');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [campus, setCampus] = useState(user?.campus || 'Maceió');

  // Preferências
  const [preferredAreas, setPreferredAreas] = useState(user?.preferences?.areas || {
    tecnologia: true,
    exatas: false,
    biologicas: false,
    gestao: true,
  });

  const [preferredModalities, setPreferredModalities] = useState(user?.preferences?.modalities || {
    tecnico: true,
    bacharelado: false,
    licenciatura: false,
    tecnologo: true,
  });

  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card text-center" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar logado para acessar seu perfil.</p>
          <button className="btn-save-profile" onClick={() => navigate('/')}>
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        name,
        avatar: photoUrl,
        bio,
        phone,
        campus,
        preferences: {
          areas: preferredAreas,
          modalities: preferredModalities,
        },
      });
    } catch {
      // O contexto já apresenta a mensagem de erro ao usuário.
    } finally {
      setSaving(false);
    }
  };

  const toggleArea = (key) => {
    setPreferredAreas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleModality = (key) => {
    setPreferredModalities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="profile-page">
      <div className="profile-top-bar">
        <ButtonVoltar onClick={() => navigate(-1)} />
        <h1 className="profile-page-title">Meu Perfil</h1>
      </div>

      <div className="profile-layout">
        {/* Banner do Perfil */}
        <div className="profile-hero-card">
          <div className="profile-avatar-wrapper">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="profile-avatar-img" onError={() => setPhotoUrl('')} />
            ) : (
              <div className="profile-avatar-placeholder">
                {isAdmin ? '👑' : userInitial}
              </div>
            )}
          </div>

          <div className="profile-hero-info">
            <h2 className="profile-name-text">{name || user.email}</h2>
            <p className="profile-email-text">{user.email}</p>

            <div className="profile-badges-row">
              {isAdmin ? (
                <span className="profile-status-tag admin">
                  Administrador do Sistema
                </span>
              ) : (
                <span
                  className="profile-status-tag student"
                  style={{
                    color: userEvolution.badgeColor,
                    background: userEvolution.badgeBg,
                    borderColor: userEvolution.badgeBorder,
                  }}
                >
                  {userEvolution.badge} {userEvolution.count > 0 ? `· Média (${userEvolution.average}%)` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="profile-tabs-header">
          <button
            className={`profile-tab-btn ${activeTab === 'dados' ? 'active' : ''}`}
            onClick={() => setActiveTab('dados')}
          >
            👤 Dados Pessoais
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'preferencias' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferencias')}
          >
            🎯 Preferências de Conteúdo
          </button>
          {isAdmin && (
            <button
              className={`profile-tab-btn admin-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              ⚡ Painel de Extração
            </button>
          )}
        </div>

        {/* Conteúdo das Abas */}
        <div className="profile-card">
          {activeTab === 'dados' && (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label>Foto de Perfil (URL da Imagem ou Avatar)</label>
                <div className="photo-input-group">
                  <input
                    type="url"
                    className="profile-input"
                    placeholder="https://exemplo.com/minha-foto.png"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                  {photoUrl && (
                    <div className="photo-preview-thumb">
                      <img src={photoUrl} alt="Preview" onError={() => setPhotoUrl('')} />
                    </div>
                  )}
                </div>
                <span className="form-hint">Cole o link direto da sua foto de perfil para exibição instantânea.</span>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    className="profile-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefone / Contato</label>
                  <input
                    type="tel"
                    className="profile-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(82) 99999-9999"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Campus do IFAL de Interesse</label>
                <select
                  className="profile-select"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                >
                  <option value="Maceió">Campus Maceió</option>
                  <option value="Arapiraca">Campus Arapiraca</option>

                </select>
              </div>

              <div className="form-group">
                <label>Biografia / Sobre Mim</label>
                <textarea
                  className="profile-textarea"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Escreva um breve resumo sobre você e seus objetivos de estudo..."
                />
              </div>

              <div className="profile-form-actions">
                <button type="submit" className="btn-save-profile" disabled={saving}>
                  {saving ? 'Salvando...' : '💾 Salvar Dados Pessoais'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preferencias' && (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <h3>Áreas de Conhecimento de Interesse</h3>
              <p className="form-hint">Selecione os temas que você mais busca no Prepara IF:</p>

              <div className="preferences-grid">
                <label className={`pref-chip ${preferredAreas.tecnologia ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={preferredAreas.tecnologia}
                    onChange={() => toggleArea('tecnologia')}
                  />
                  <span>💻 Tecnologia & Informática</span>
                </label>

                <label className={`pref-chip ${preferredAreas.exatas ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={preferredAreas.exatas}
                    onChange={() => toggleArea('exatas')}
                  />
                  <span>📐 Engenharia & Exatas</span>
                </label>

                <label className={`pref-chip ${preferredAreas.biologicas ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={preferredAreas.biologicas}
                    onChange={() => toggleArea('biologicas')}
                  />
                  <span>🧬 Ciências Biológicas & Saúde</span>
                </label>

                <label className={`pref-chip ${preferredAreas.gestao ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={preferredAreas.gestao}
                    onChange={() => toggleArea('gestao')}
                  />
                  <span>📊 Gestão & Negócios</span>
                </label>
              </div>

              <h3 style={{ marginTop: '28px' }}>Modalidades de Ensino Preferidas</h3>

              <div className="preferences-grid">
                <label className={`pref-chip ${preferredModalities.tecnico ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={preferredModalities.tecnico}
                    onChange={() => toggleModality('tecnico')}
                  />
                  <span>🛠️ Ensino Técnico</span>
                </label>

                <label className={`pref-chip ${preferredModalities.bacharelado ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={preferredModalities.bacharelado}
                    onChange={() => toggleModality('bacharelado')}
                  />
                  <span>🎓 Bacharelado</span>
                </label>

                <label className={`pref-chip ${preferredModalities.licenciatura ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={preferredModalities.licenciatura}
                    onChange={() => toggleModality('licenciatura')}
                  />
                  <span>📚 Licenciatura</span>
                </label>

                <label className={`pref-chip ${preferredModalities.tecnologo ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={preferredModalities.tecnologo}
                    onChange={() => toggleModality('tecnologo')}
                  />
                  <span>⚙️ Tecnólogo</span>
                </label>
              </div>

              <div className="profile-form-actions" style={{ marginTop: '32px' }}>
                <button type="submit" className="btn-save-profile" disabled={saving}>
                  {saving ? 'Salvando...' : '🎯 Salvar Preferências'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'admin' && isAdmin && (
            <div className="admin-profile-section">
              <div className="admin-banner-box">
                <div className="admin-banner-text">
                  <h3>⚡ Painel de Extração e Controle Administrativo</h3>
                  <p>
                    Como Administrador, você tem permissão total para extrair PDFs de exames, criar e editar novos Editais, Cursos e Provas no banco de dados.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-launch-extraction"
                  onClick={() => navigate('/admin')}
                >
                  🚀 Abrir Painel de Extração
                </button>
              </div>

              <div className="admin-info-grid">
                <div className="admin-info-card">
                  <h4>📄 Extração Inteligente de PDFs</h4>
                  <p>Upload e leitor com IA para extrair provas, textos de apoio, imagens, opções e gabaritos automaticamente.</p>
                </div>

                <div className="admin-info-card">
                  <h4>🗄️ Conexão direta com Banco Supabase</h4>
                  <p>Sincronização em tempo real das tabelas PostgreSQL de Provas, Questões, Cursos e Editais.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
