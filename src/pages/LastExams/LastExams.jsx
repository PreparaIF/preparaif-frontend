import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit } from "lucide-react";
import { fetchExams } from "../../services/exams";
import { useAuth } from "../../contexts/auth-context";
import ButtonVoltar from "../../components/Utils/ButtonVoltar";
import LoadingSpinner from "../../components/Utils/LoadingSpinner";
import "./LastExams.css";

export default function LastExams() {
  const navigate = useNavigate();
  const { user, openAuthModal, isAdmin } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Prepara IF - Provas Anteriores";
    fetchExams()
      .then(setExams)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const [nivelFilter, setNivelFilter] = useState('');
  const [anoFilter, setAnoFilter] = useState('');

  // Regra dinamica da home: extrair parametros de anos existentes no dataset
  const anos = useMemo(() => {
    const extractedAnos = exams.map((e) => {
      const match = (e.title || '').match(/\b(20\d{2})\b/);
      return match ? match[1] : null;
    }).filter(Boolean);
    return [...new Set(extractedAnos)].sort().reverse();
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const title = (e.title || '').toLowerCase();
      const matchesNivel =
        !nivelFilter ||
        (nivelFilter === 'tecnico' && (title.includes('técnico') || title.includes('integrado') || title.includes('subsequente') || !title.includes('superior'))) ||
        (nivelFilter === 'superior' && (title.includes('superior') || title.includes('bacharelado') || title.includes('licenciatura')));
      
      const matchesAno = !anoFilter || (e.title || '').includes(anoFilter);
      return matchesNivel && matchesAno;
    });
  }, [exams, nivelFilter, anoFilter]);

  const handleStartExam = (examId) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    navigate(`/exame/${examId}`);
  };

  return (
    <div className="section-page-container">
      <div className="section-top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ButtonVoltar onClick={() => navigate("/")} />
        {isAdmin && (
          <button
            type="button"
            className="admin-add-element-btn"
            onClick={() => navigate('/admin?tab=prova')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#00875F', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            <Plus size={16} /> Adicionar Prova
          </button>
        )}
      </div>

      <div className="section-page-hero">
        <h1 className="section-page-title">Provas Anteriores</h1>
        <p className="section-page-subtitle">
          Pratique com exames das edições anteriores dos seletores do IFAL e acompanhe seu rendimento.
        </p>
      </div>

      {/* Cards & Filters */}
      {loading ? (
        <LoadingSpinner text="Carregando provas anteriores..." />
      ) : (
        <>
          {/* Pill Filter Bar (Dinâmico) */}
          <div className="pill-filters-row">
            <select
              className="pill-filter-select"
              value={nivelFilter}
              onChange={(e) => setNivelFilter(e.target.value)}
            >
              <option value="">Todos os níveis</option>
              <option value="tecnico">Ensino Técnico</option>
              <option value="superior">Ensino Superior</option>
            </select>

            <select
              className="pill-filter-select"
              value={anoFilter}
              onChange={(e) => setAnoFilter(e.target.value)}
            >
              <option value="">Todos os anos</option>
              {anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>

          <div className="section-cards-grid">
            {filteredExams.length === 0 ? (
              <div className="section-empty-box">
                <p>Nenhuma prova encontrada nesta categoria.</p>
              </div>
            ) : (
              filteredExams.map((exam) => (
                <div className="last-exam-card" key={exam.id}>
                  <div className="exam-card-cover">
                    <div className="cover-text-overlay">
                      <span className="cover-subtitle">
                        {exam.examType || 'Processo Seletivo IFAL'}
                      </span>
                      <h3 className="cover-title">{exam.title}</h3>
                    </div>
                    {exam.year && (
                      <span className="exam-year-badge">{exam.year}</span>
                    )}
                  </div>

                  <div className="exam-card-footer">
                    <div className="footer-info-group">
                      <div className="info-block">
                        <span className="info-value">
                          {exam.questionCount} questões
                        </span>
                        <span className="info-label">Total</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn-edit-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin?tab=prova&editId=${exam.id}`);
                          }}
                          title="Editar esta prova"
                          style={{ padding: '8px 12px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '12px' }}
                        >
                          <Edit size={14} /> Editar
                        </button>
                      )}
                      <button
                        className="btn-fazer-prova"
                        onClick={() => handleStartExam(exam.id)}
                      >
                        Fazer a prova
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
