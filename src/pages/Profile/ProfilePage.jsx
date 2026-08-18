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
  Database,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';
import { fetchPreferences } from '../../services/preferences';
import { apiGetMyAttempts } from '../../services/attempts';
import { fetchExams } from '../../services/exams';
import { fetchEditais } from '../../services/edital';
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
  const [userAttempts, setUserAttempts] = useState([]);
  const [recommendedExams, setRecommendedExams] = useState([]);
  const [recommendedEditais, setRecommendedEditais] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences()
      .then((data) => setDbPreferences(data || []))
      .catch((err) => console.error("Erro ao buscar preferências:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('preparaif_token') || localStorage.getItem('preparaif-token');
    const loadDevData = async () => {
      try {
        const [attemptsRes, examsRes, editaisRes] = await Promise.allSettled([
          token ? apiGetMyAttempts(token) : Promise.resolve([]),
          fetchExams(),
          fetchEditais(),
        ]);

        const attempts = attemptsRes.status === 'fulfilled' && Array.isArray(attemptsRes.value)
          ? attemptsRes.value
          : (user?.attempts || []);
        setUserAttempts(attempts);

        const exams = examsRes.status === 'fulfilled' && Array.isArray(examsRes.value)
          ? examsRes.value
          : [];
        setRecommendedExams(exams.slice(0, 3));

        const editais = editaisRes.status === 'fulfilled' && Array.isArray(editaisRes.value)
          ? editaisRes.value
          : [];
        setRecommendedEditais(editais.slice(0, 3));
      } catch (err) {
        console.error("Erro ao carregar dados do painel do estudante:", err);
      }
    };
    loadDevData();
  }, [user]);

  const totalAttemptsCount = userAttempts.length;
  let totalQuestionsAnswered = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;

  userAttempts.forEach(att => {
    const score = Number(att.score || 0);
    const total = Number(att.total || 0);
    totalCorrect += score;
    totalQuestionsAnswered += total;
    totalIncorrect += Math.max(0, total - score);
  });

  const overallAccuracy = totalQuestionsAnswered > 0
    ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
    : (userEvolution.average || 0);

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
            className={`profile-tab-btn ${activeTab === 'desenvolvimento' ? 'active' : ''}`}
            onClick={() => setActiveTab('desenvolvimento')}
          >
            <TrendingUp size={18} /> Desenvolvimento & Desempenho
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

          {activeTab === 'desenvolvimento' && (
            <div className="dev-dashboard-section" style={{ padding: '8px 4px' }}>
              {/* Banner Hero do Estudante */}
              <div className="dev-banner" style={{ background: 'linear-gradient(135deg, #00875F 0%, #047857 100%)', padding: '24px 28px', borderRadius: '18px', color: '#fff', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px' }}>
                    Painel de Desenvolvimento & Desempenho
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '10px 0 4px', color: '#ffffff' }}>
                    Seu Progresso de Preparação no IFAL
                  </h2>
                  <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
                    Acompanhe seu histórico de acertos, pontos a revisar e exames sugeridos com base no seu perfil.
                  </p>
                </div>

                <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', display: 'block', opacity: 0.9 }}>Média Geral</span>
                  <strong style={{ fontSize: '32px', fontWeight: '900', display: 'block' }}>{overallAccuracy}%</strong>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>{userEvolution.badge}</span>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="dev-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {/* Acertos */}
                <div className="metric-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Questões Acertadas</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#00875F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <strong style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', display: 'block' }}>{totalCorrect}</strong>
                  <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalQuestionsAnswered > 0 ? (totalCorrect / totalQuestionsAnswered) * 100 : 0}%`, background: '#00875F', height: '100%', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#00875F', fontWeight: '700', marginTop: '6px', display: 'block' }}>
                    {totalQuestionsAnswered > 0 ? `${Math.round((totalCorrect / totalQuestionsAnswered) * 100)}% de acertos` : 'Comece a praticar!'}
                  </span>
                </div>

                {/* Erros */}
                <div className="metric-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Pontos a Revisar (Erros)</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <XCircle size={20} />
                    </div>
                  </div>
                  <strong style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', display: 'block' }}>{totalIncorrect}</strong>
                  <div style={{ width: '100%', background: '#e2e8f0', height: '6px', borderRadius: '4px', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${totalQuestionsAnswered > 0 ? (totalIncorrect / totalQuestionsAnswered) * 100 : 0}%`, background: '#ef4444', height: '100%', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', marginTop: '6px', display: 'block' }}>
                    {totalQuestionsAnswered > 0 ? `${Math.round((totalIncorrect / totalQuestionsAnswered) * 100)}% para reforço` : 'Nenhum erro registrado'}
                  </span>
                </div>

                {/* Simulados Concluídos */}
                <div className="metric-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Simulados Realizados</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                  </div>
                  <strong style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', display: 'block' }}>{totalAttemptsCount}</strong>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '700', marginTop: '16px', display: 'block' }}>
                    {totalAttemptsCount > 0 ? `${totalAttemptsCount} exames finalizados` : 'Nenhum simulado feito ainda'}
                  </span>
                </div>

                {/* Nível do Estudante */}
                <div className="metric-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Status de Evolução</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: userEvolution.badgeBg || '#ecfdf5', color: userEvolution.badgeColor || '#00875F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Award size={20} />
                    </div>
                  </div>
                  <strong style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', display: 'block', marginTop: '4px' }}>{userEvolution.badge || 'Iniciante'}</strong>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '10px', display: 'block' }}>
                    Campus: {campus}
                  </span>
                </div>
              </div>

              {/* Histórico de Tentativas Recentes */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={20} color="#00875F" /> Histórico Recente de Simulados
                </h3>

                {userAttempts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1' }}>
                    <FileText size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px', color: '#334155' }}>Você ainda não realizou nenhum simulado</h4>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                      Acesse a seção de provas para resolver questões anteriores e acompanhar seus acertos e erros em tempo real.
                    </p>
                    <button
                      type="button"
                      className="btn-save-profile"
                      onClick={() => navigate('/provas')}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Rocket size={16} /> Ir para Provas Anteriores
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {userAttempts.map((att, idx) => {
                      const score = Number(att.score || 0);
                      const total = Number(att.total || 1);
                      const pct = Math.round((score / total) * 100);
                      const isGood = pct >= 60;
                      return (
                        <div
                          key={att.id || idx}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isGood ? '#ecfdf5' : '#fef2f2', color: isGood ? '#00875F' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                              {pct}%
                            </div>
                            <div>
                              <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                                {att.exam?.title || att.examTitle || `Simulado #${att.id || idx + 1}`}
                              </strong>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                {score} acertos de {total} questões · {att.completedAt ? new Date(att.completedAt).toLocaleDateString('pt-BR') : 'Recentemente'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(att.examId ? `/exame/${att.examId}` : '/provas')}
                            style={{ padding: '6px 14px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '700', color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            Refazer <RotateCcw size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Próximos Exames & Editais Recomendados baseados nas Preferências */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={20} color="#00875F" /> Exames & Editais Recomendados para Você
                    </h3>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Recomendações baseadas nas suas preferências ativas de estudo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preferencias')}
                    style={{ background: 'none', border: 'none', color: '#00875F', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Ajustar Preferências <ChevronRight size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {recommendedExams.map((exam) => (
                    <div key={exam.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#00875F', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '8px' }}>
                          Prova Sugerida {exam.year ? `· ${exam.year}` : ''}
                        </span>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px', color: '#0f172a' }}>{exam.title}</h4>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
                          {exam.questionCount || (exam.questions ? exam.questions.length : 0)} questões formatadas para o IFAL
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-save-profile"
                        onClick={() => navigate(`/exame/${exam.id}`)}
                        style={{ width: '100%', padding: '10px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        Fazer a Prova <ArrowRight size={16} />
                      </button>
                    </div>
                  ))}

                  {recommendedEditais.map((edital) => (
                    <div key={edital.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '8px' }}>
                          Edital Recente
                        </span>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px', color: '#0f172a' }}>{edital.title}</h4>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>
                          {edital.description ? `${edital.description.slice(0, 80)}...` : 'Consulte as informações do edital público do IFAL.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/edital/${edital.id}`)}
                        style={{ width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: '#1e293b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        Ver Edital <BookOpen size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
