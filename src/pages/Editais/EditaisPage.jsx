import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEditais } from '../../services/edital';
import EditalCard from '../../components/Edital/EditalCard';
import ButtonVoltar from '../../components/Utils/ButtonVoltar';
import LoadingSpinner from '../../components/Utils/LoadingSpinner';
import './EditaisPage.css';

export default function EditaisPage() {
  const navigate = useNavigate();
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');

  useEffect(() => {
    document.title = 'Prepara IF - Editais Anteriores';
    fetchEditais()
      .then((data) => {
        // Atribuir status simulados para demonstração se não existirem
        const enriched = (data || []).map((e, idx) => {
          let status = e.status || 'aberto';
          if (idx % 3 === 1) status = 'ultimos_dias';
          if (idx % 3 === 2) status = 'fechado';
          return { ...e, status };
        });
        setEditais(enriched);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const [statusFilter, setStatusFilter] = useState('');
  const [anoFilter, setAnoFilter] = useState('');

  // Regra dinamica da home: extrair parametros existentes no dataset
  const statuses = useMemo(() => {
    return [...new Set(editais.map((e) => e.status).filter(Boolean))];
  }, [editais]);

  const anos = useMemo(() => {
    const extractedAnos = editais.map((e) => {
      const match = (e.title || '' + ' ' + (e.time || '')).match(/\b(20\d{2})\b/);
      return match ? match[1] : null;
    }).filter(Boolean);
    return [...new Set(extractedAnos)].sort().reverse();
  }, [editais]);

  const filteredEditais = useMemo(() => {
    return editais.filter((e) => {
      const matchesStatus = !statusFilter || e.status === statusFilter;
      const text = (e.title || '') + ' ' + (e.time || '');
      const matchesAno = !anoFilter || text.includes(anoFilter);
      return matchesStatus && matchesAno;
    });
  }, [editais, statusFilter, anoFilter]);

  const formatStatusLabel = (statusKey) => {
    if (statusKey === 'aberto') return '🟢 Em Aberto';
    if (statusKey === 'ultimos_dias') return '⏳ Últimos Dias';
    if (statusKey === 'fechado') return '🔴 Encerrados';
    return statusKey;
  };

  return (
    <div className="section-page-container">
      <div className="section-top-header">
        <ButtonVoltar onClick={() => navigate('/')} />
      </div>

      <div className="section-page-hero">
        <h1 className="section-page-title">Editais Anteriores</h1>
        <p className="section-page-subtitle">
          Acompanhe todos os editais de processos seletivos do IFAL por status de abertura e ano.
        </p>
      </div>

      {/* Cards & Filters */}
      {loading ? (
        <LoadingSpinner text="Carregando editais..." />
      ) : (
        <>
          {/* Pill Filter Bar (Dinâmico) */}
          <div className="pill-filters-row">
            <select
              className="pill-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos os status</option>
              {statuses.map((st) => (
                <option key={st} value={st}>
                  {formatStatusLabel(st)}
                </option>
              ))}
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

          <div className="editais-grid-layout">
            {filteredEditais.length === 0 ? (
              <div className="section-empty-box">
                <p>Nenhum edital encontrado neste status.</p>
              </div>
            ) : (
              filteredEditais.map((edital) => (
                <div className="edital-status-card-wrapper" key={edital.id}>
                  <div className="edital-status-header">
                    {edital.status === 'aberto' && (
                      <span className="status-badge status-open">🟢 Inscrições Abertas</span>
                    )}
                    {edital.status === 'ultimos_dias' && (
                      <span className="status-badge status-warning">⏳ Últimos Dias</span>
                    )}
                    {edital.status === 'fechado' && (
                      <span className="status-badge status-closed">🔴 Encerrado</span>
                    )}
                  </div>
                  <EditalCard edital={edital} />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
