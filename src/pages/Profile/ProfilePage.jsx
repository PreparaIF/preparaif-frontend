import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Target,
  Zap,
  Crown,
  Camera,
  Trash2,
  Save,
  Laptop,
  Ruler,
  Dna,
  BarChart3,
  Wrench,
  GraduationCap,
  BookOpen,
  Settings,
  Rocket,
  FileText,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchPreferences } from '../../services/preferences';
import { DynamicIcon } from '../../components/Utils/IconPicker';
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

  const [dbPreferences, setDbPreferences] = useState([]);
  const [selectedPrefIds, setSelectedPrefIds] = useState(user?.preferences?.selectedIds || [1, 4, 5, 8]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences()
      .then((data) => setDbPreferences(data || []))
      .catch((err) => console.error("Erro ao buscar preferências:", err));
  }, []);

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
          selectedIds: selectedPrefIds,
        },
      });
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (prefId) => {
    setSelectedPrefIds((prev) =>
      prev.includes(prefId)
        ? prev.filter((id) => id !== prefId)
        : [...prev, prefId]
    );
  };

  const handleFileUpload = (e, setTarget) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setTarget(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-top-bar">
        <ButtonVoltar onClick={() => navigate(-1)} />
        <h1 className="profile-page-title">Meu Perfil</h1>
      </div>

      <div className="profile-layout">
        <div className="profile-hero-card">
          <div className="profile-avatar-wrapper">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="profile-avatar-img" onError={() => setPhotoUrl('')} />
            ) : (
              <div className="profile-avatar-placeholder">
                {isAdmin ? <Crown size={28} color="#FFD700" /> : userInitial}
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

        <div className="profile-tabs-header">
          <button
            className={`profile-tab-btn ${activeTab === 'dados' ? 'active' : ''}`}
            onClick={() => setActiveTab('dados')}
          >
            <User size={18} /> Dados Pessoais
          </button>
          <button
            className={`profile-tab-btn ${activeTab === 'preferencias' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferencias')}
          >
            <Target size={18} /> Preferências de Conteúdo
          </button>
          {isAdmin && (
            <button
              className={`profile-tab-btn admin-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Zap size={18} /> Painel de Extração
            </button>
          )}
        </div>

        <div className="profile-card">
          {activeTab === 'dados' && (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <div className="form-group">
                <label>Foto de Perfil</label>
                <div className="photo-upload-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="upload-btn-row" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <label className="btn-upload-file" style={{ cursor: 'pointer', padding: '10px 16px', background: '#00875F', color: '#fff', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Camera size={16} /> Enviar Foto do Dispositivo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, setPhotoUrl)}
                      />
                    </label>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        style={{ background: '#FF4D4D', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Trash2 size={14} /> Remover Foto
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="profile-input"
                    placeholder="Ou insira a URL direta da imagem (https://...)..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                  {photoUrl && (
                    <div className="photo-preview-thumb" style={{ marginTop: '8px' }}>
                      <img src={photoUrl} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00875F' }} onError={() => setPhotoUrl('')} />
                    </div>
                  )}
                </div>
                <span className="form-hint">Faça o upload de uma imagem do seu dispositivo ou insira o link direto.</span>
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
                <button type="submit" className="btn-save-profile" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Dados Pessoais'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preferencias' && (
            <form onSubmit={handleSaveProfile} className="profile-form">
              <h3>Áreas de Conhecimento de Interesse</h3>
              <p className="form-hint">Selecione os temas que você mais busca no Prepara IF:</p>

              <div className="preferences-grid">
                {dbPreferences.filter(p => p.category === 'AREA').map((pref) => {
                  const isSelected = selectedPrefIds.includes(pref.id);
                  return (
                    <label key={pref.id} className={`pref-chip ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePref(pref.id)}
                      />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <DynamicIcon name={pref.icon} size={16} /> {pref.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <h3 style={{ marginTop: '28px' }}>Modalidades de Ensino Preferidas</h3>

              <div className="preferences-grid">
                {dbPreferences.filter(p => p.category === 'MODALIDADE').map((pref) => {
                  const isSelected = selectedPrefIds.includes(pref.id);
                  return (
                    <label key={pref.id} className={`pref-chip ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePref(pref.id)}
                      />
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <DynamicIcon name={pref.icon} size={16} /> {pref.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {dbPreferences.filter(p => p.category !== 'AREA' && p.category !== 'MODALIDADE').length > 0 && (
                <>
                  <h3 style={{ marginTop: '28px' }}>Outras Preferências Cadastradas</h3>
                  <div className="preferences-grid">
                    {dbPreferences.filter(p => p.category !== 'AREA' && p.category !== 'MODALIDADE').map((pref) => {
                      const isSelected = selectedPrefIds.includes(pref.id);
                      return (
                        <label key={pref.id} className={`pref-chip ${isSelected ? 'selected' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePref(pref.id)}
                          />
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <DynamicIcon name={pref.icon} size={16} /> {pref.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="profile-form-actions" style={{ marginTop: '32px' }}>
                <button type="submit" className="btn-save-profile" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} /> {saving ? 'Salvando...' : 'Salvar Preferências'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'admin' && isAdmin && (
            <div className="admin-profile-section">
              <div className="admin-banner-box">
                <div className="admin-banner-text">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={22} color="#00875F" /> Painel de Extração e Controle Administrativo</h3>
                  <p>
                    Como Administrador, você tem permissão total para extrair PDFs de exames, criar e editar novos Editais, Cursos e Provas no banco de dados.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-launch-extraction"
                  onClick={() => navigate('/admin')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <Rocket size={18} /> Abrir Painel de Extração
                </button>
              </div>

              <div className="admin-info-grid">
                <div className="admin-info-card">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Extração Inteligente de PDFs</h4>
                  <p>Upload e leitor com IA para extrair provas, textos de apoio, imagens, opções e gabaritos automaticamente.</p>
                </div>

                <div className="admin-info-card">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Database size={18} /> Conexão direta com Banco Supabase</h4>
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
