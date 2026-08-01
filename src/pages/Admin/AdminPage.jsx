import React, { useState, useRef } from 'react';
import { uploadDocumento } from '../../services/upload';
import ButtonVoltar from '../../components/Utils/ButtonVoltar';
import './AdminPage.css';

const TABS = [
  { id: 'prova', label: '📄 Prova (PDF)', desc: 'Extrai questões, alternativas e imagens' },
  { id: 'edital', label: '📜 Edital (PDF)', desc: 'Extrai título, descrição e conteúdo' },
  { id: 'curso', label: '🎓 Curso (PDF)', desc: 'Extrai nome, campus, turno e modalidade' },
  { id: 'texto', label: '✍️ Texto Livre', desc: 'Limpa e estrutura qualquer texto' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('prova');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [result, setResult] = useState(null);
  const [salvarBanco, setSalvarBanco] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingGab, setIsDraggingGab] = useState(false);
  const fileInputRef = useRef(null);
  const gabaritoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    ano: '',
    exame_num: '',
    texto: '',
    titulo_personalizado: '',
    instituteName: 'IFAL',
  });
  const [file, setFile] = useState(null);
  const [fileGabarito, setFileGabarito] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    } else if (selectedFile) {
      setMessage({ type: 'error', text: 'Apenas arquivos PDF são aceitos.' });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFileSelect(dropped);
  };

  const handleGabaritoSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFileGabarito(selectedFile);
    } else if (selectedFile) {
      setMessage({ type: 'error', text: 'Apenas arquivos PDF são aceitos para o gabarito.' });
    }
  };

  const handleGabaritoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleGabaritoSelect(e.target.files[0]);
    }
  };

  const handleDropGabarito = (e) => {
    e.preventDefault();
    setIsDraggingGab(false);
    const dropped = e.dataTransfer.files[0];
    handleGabaritoSelect(dropped);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' });
    setResult(null);
    setFile(null);
    setFileGabarito(null);
    setFormData({ ano: '', exame_num: '', texto: '', titulo_personalizado: '', instituteName: 'IFAL' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResult(null);

    try {
      if (activeTab === 'prova' && (!formData.ano || !formData.exame_num)) {
        throw new Error('Ano e número do exame são obrigatórios para provas.');
      }
      if ((activeTab === 'prova' || activeTab === 'edital' || activeTab === 'curso') && !file) {
        throw new Error('Por favor, selecione um arquivo PDF.');
      }
      if (activeTab === 'texto' && !formData.texto.trim()) {
        throw new Error('Por favor, insira o texto.');
      }

      const metadata = {
        ano: formData.ano,
        exame_num: formData.exame_num,
        texto: formData.texto,
        titulo_personalizado: formData.titulo_personalizado,
        instituteName: formData.instituteName,
        salvar_banco: salvarBanco,
        file_gabarito: fileGabarito,
      };

      const res = await uploadDocumento(activeTab, file, metadata);

      const msgTexto = res.mensagem || 'Processamento concluído!';
      const salvoExtra = res.salvo && res.registro_criado
        ? ` Salvo no banco com ID ${res.registro_criado.id}.`
        : '';

      setMessage({ type: 'success', text: msgTexto + salvoExtra });
      setResult(res.dados);

    } catch (error) {
      console.error('Erro no upload:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Erro desconhecido. Verifique se o backend e o robô estão rodando.',
      });
    } finally {
      setLoading(false);
    }
  };

  const activeTabInfo = TABS.find(t => t.id === activeTab);

  return (
    <div className="admin-page">
      <div className="admin-top-bar">
        <ButtonVoltar />
      </div>
      <div className="admin-hero">
        <span className="admin-badge">Extração de PDFs</span>
        <h1 className="admin-title">Processamento de Documentos</h1>
        <p className="admin-subtitle">
          Envie PDFs de Provas, Editais ou Cursos para extração automática e inteligente de dados.
        </p>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="sidebar-label">Tipo de documento</p>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="sidebar-tab-label">{tab.label}</span>
              <span className="sidebar-tab-desc">{tab.desc}</span>
            </button>
          ))}

          <div className="sidebar-divider" />

          <label className="save-toggle">
            <input
              type="checkbox"
              checked={salvarBanco}
              onChange={e => setSalvarBanco(e.target.checked)}
            />
            <span className="save-toggle-slider" />
            <span className="save-toggle-label">
              Salvar no banco após extração
            </span>
          </label>
          <p className="save-hint">
            {salvarBanco
              ? '✅ Os dados extraídos serão persistidos automaticamente.'
              : '⚠️ Apenas visualização. Nada será salvo.'}
          </p>
        </aside>

        <main className="admin-main">
          {message.text && (
            <div className={`admin-alert ${message.type}`}>
              {message.type === 'success' ? '✅' : '❌'} {message.text}
            </div>
          )}

          <form className="admin-form-card" onSubmit={handleSubmit}>
            <div className="form-card-header">
              <h2>{activeTabInfo.label}</h2>
              <span className="form-card-hint">{activeTabInfo.desc}</span>
            </div>

            {activeTab === 'prova' && (
              <div className="form-row">
                <div className="form-group">
                  <label>Ano da Prova *</label>
                  <input
                    type="text"
                    name="ano"
                    placeholder="Ex: 2025"
                    value={formData.ano}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Número do Exame *</label>
                  <input
                    type="text"
                    name="exame_num"
                    placeholder="Ex: 01"
                    value={formData.exame_num}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            {(activeTab === 'prova' || activeTab === 'edital' || activeTab === 'curso') && (
              <div className="form-group">
                <label>Título personalizado <span className="label-optional">(opcional — o robô detecta automaticamente)</span></label>
                <input
                  type="text"
                  name="titulo_personalizado"
                  placeholder="Ex: IFAL 2025 - Processo Seletivo Integrado"
                  value={formData.titulo_personalizado}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {(activeTab === 'edital' || activeTab === 'curso') && (
              <div className="form-group">
                <label>Instituição</label>
                <input
                  type="text"
                  name="instituteName"
                  placeholder="Ex: IFAL"
                  value={formData.instituteName}
                  onChange={handleInputChange}
                />
              </div>
            )}

            {(activeTab === 'prova' || activeTab === 'edital' || activeTab === 'curso') && (
              <div className="form-group">
                <label>Arquivo PDF *</label>
                <div
                  className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {file ? (
                    <div className="drop-zone-file">
                      <span className="drop-zone-icon">📄</span>
                      <div>
                        <p className="drop-zone-filename">{file.name}</p>
                        <p className="drop-zone-size">
                          {(file.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="drop-zone-empty">
                      <span className="drop-zone-icon">📁</span>
                      <p className="drop-zone-text">Arraste o PDF da prova aqui ou clique para procurar</p>
                      <p className="drop-zone-hint">Suporte a PDFs de até 50 MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prova' && (
              <div className="form-group">
                <label>PDF do Gabarito <span className="label-optional">(opcional — o robô extrai as respostas automaticamente)</span></label>
                <div
                  className={`drop-zone drop-zone-secondary ${isDraggingGab ? 'dragging' : ''} ${fileGabarito ? 'has-file' : ''}`}
                  onDragOver={e => { e.preventDefault(); setIsDraggingGab(true); }}
                  onDragLeave={() => setIsDraggingGab(false)}
                  onDrop={handleDropGabarito}
                  onClick={() => gabaritoInputRef.current?.click()}
                >
                  <input
                    ref={gabaritoInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleGabaritoChange}
                    style={{ display: 'none' }}
                  />
                  {fileGabarito ? (
                    <div className="drop-zone-file">
                      <span className="drop-zone-icon">📊</span>
                      <div>
                        <p className="drop-zone-filename">{fileGabarito.name}</p>
                        <p className="drop-zone-size">
                          {(fileGabarito.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="drop-zone-empty compact">
                      <span className="drop-zone-icon-sm">📑</span>
                      <div>
                        <p className="drop-zone-text">Arraste o PDF do Gabarito aqui ou clique para procurar</p>
                        <p className="drop-zone-hint">Opcional — vincula as respostas automáticas</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'texto' && (
              <div className="form-group">
                <label>Cole ou digite seu texto *</label>
                <textarea
                  name="texto"
                  rows={10}
                  placeholder="Insira o conteúdo do texto para extração e estruturação..."
                  value={formData.texto}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <><span className="btn-loader" />Processando...</>
              ) : (
                `🚀 Extrair ${activeTab === 'prova' ? 'Questões' : activeTab === 'edital' ? 'Edital' : activeTab === 'curso' ? 'Curso' : 'Texto'}`
              )}
            </button>
          </form>

          {result && <ResultadoExtracao tipo={activeTab} dados={result} />}
        </main>
      </div>
    </div>
  );
}

function ResultadoExtracao({ tipo, dados }) {
  const [viewMode, setViewMode] = useState('visual');

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="result-header-left">
          <span className="result-badge">
            {tipo === 'prova' ? '📋 Questões Extraídas' : tipo === 'edital' ? '📜 Edital Extraído' : tipo === 'curso' ? '🎓 Curso Extraído' : '📝 Texto Processado'}
          </span>
          {tipo === 'prova' && dados.questoes && (
            <span className="result-count">{dados.questoes.length} questões</span>
          )}
        </div>
        <div className="result-view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'visual' ? 'active' : ''}`}
            onClick={() => setViewMode('visual')}
          >Visual</button>
          <button
            className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
            onClick={() => setViewMode('json')}
          >JSON</button>
        </div>
      </div>

      {viewMode === 'json' ? (
        <div className="result-json">
          {JSON.stringify(dados, null, 2)}
        </div>
      ) : (
        <div className="result-visual">
          {tipo === 'prova' && <VisualizacaoProva dados={dados} />}
          {tipo === 'edital' && <VisualizacaoEdital dados={dados} />}
          {tipo === 'curso' && <VisualizacaoCurso dados={dados} />}
          {tipo === 'texto' && <VisualizacaoTexto dados={dados} />}
        </div>
      )}
    </div>
  );
}

function VisualizacaoProva({ dados }) {
  const [questaoAberta, setQuestaoAberta] = useState(null);
  const [gabaritos, setGabaritos] = useState(() => {
    const map = {};
    (dados.questoes || []).forEach(q => {
      map[q.numero_questao] = q.gabarito ?? 0;
    });
    return map;
  });

  const handleSelectGabarito = (numQuestao, idxLetra) => {
    setGabaritos(prev => ({
      ...prev,
      [numQuestao]: idxLetra,
    }));
    const qObj = (dados.questoes || []).find(q => q.numero_questao === numQuestao);
    if (qObj) {
      qObj.gabarito = idxLetra;
    }
  };

  const letras = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="viz-prova">
      <div className="viz-prova-header">
        <div className="viz-info-row">
          <span className="viz-label">Título detectado:</span>
          <strong className="viz-value">{dados.titulo_detectado || '—'}</strong>
        </div>
        <div className="viz-info-row">
          <span className="viz-label">Total de questões:</span>
          <strong className="viz-value">{dados.total_questoes}</strong>
        </div>
      </div>

      <div className="questoes-list">
        {(dados.questoes || []).map((q) => {
          const gabaritoAtual = gabaritos[q.numero_questao] ?? 0;
          const letraAtual = letras[gabaritoAtual] || 'A';

          return (
            <div
              key={q.numero_questao}
              className={`questao-card ${questaoAberta === q.numero_questao ? 'open' : ''}`}
            >
              <button
                className="questao-header"
                type="button"
                onClick={() => setQuestaoAberta(questaoAberta === q.numero_questao ? null : q.numero_questao)}
              >
                <span className="questao-num">Questão {q.numero_questao}</span>
                <div className="questao-badges">
                  <span className="badge badge-gabarito">
                    ✅ Gabarito: {letraAtual}
                  </span>
                  {q.imagens?.length > 0 && (
                    <span className="badge badge-img">🖼️ {q.imagens.length} img</span>
                  )}
                  {Object.keys(q.alternativas || {}).length > 0 && (
                    <span className="badge badge-alt">{Object.keys(q.alternativas).length} alternativas</span>
                  )}
                </div>
                <span className="questao-arrow">{questaoAberta === q.numero_questao ? '▲' : '▼'}</span>
              </button>

              {questaoAberta === q.numero_questao && (
                <div className="questao-body">
                  {q.texto_de_apoio && q.texto_de_apoio.trim() !== '' && q.texto_de_apoio.trim() !== q.enunciado?.trim() && (
                    <div className="questao-apoio">
                      <span className="questao-section-label">Texto de apoio</span>
                      {q.texto_de_apoio.split('\n\n').map((paragrafo, pIdx) => (
                        <p key={pIdx}>{paragrafo}</p>
                      ))}
                    </div>
                  )}

                  {q.imagens?.length > 0 && (
                    <div className="questao-imagens">
                      {q.imagens.map((src, idx) => (
                        <img key={idx} src={src} alt={`Imagem questão ${q.numero_questao}`} className="questao-img" />
                      ))}
                    </div>
                  )}

                  {q.enunciado && q.enunciado.trim() !== '' && (
                    <div className="questao-enunciado">
                      <span className="questao-section-label">Enunciado</span>
                      <p>{q.enunciado}</p>
                    </div>
                  )}

                  {q.creditos && q.creditos.trim() !== '' && (
                    <div className="questao-creditos">
                      <span className="questao-section-label">Créditos</span>
                      <p>{q.creditos}</p>
                    </div>
                  )}

                  <div className="alternativas-list">
                    <span className="questao-section-label">
                      Alternativas <span className="label-optional">(clique para definir resposta correta)</span>
                    </span>
                    {Object.entries(q.alternativas || {}).map(([letra, texto], idx) => {
                      const isCorreta = gabaritoAtual === idx;
                      return (
                        <div
                          key={letra}
                          className={`alternativa-item ${isCorreta ? 'correta' : ''}`}
                          onClick={() => handleSelectGabarito(q.numero_questao, idx)}
                          title="Clique para marcar como resposta correta"
                        >
                          <span className={`alternativa-letra ${isCorreta ? 'is-correta' : ''}`}>
                            {letra}
                          </span>
                          <span className="alternativa-texto">{texto}</span>
                          {isCorreta && (
                            <span className="correta-tag">✅ Resposta Correta</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VisualizacaoEdital({ dados }) {
  return (
    <div className="viz-simple">
      <div className="viz-field">
        <label>Título</label>
        <p className="viz-field-value title">{dados.titulo || '—'}</p>
      </div>
      <div className="viz-field">
        <label>Descrição</label>
        <p className="viz-field-value">{dados.descricao || '—'}</p>
      </div>
      <div className="viz-row">
        <div className="viz-field">
          <label>Tempo de leitura</label>
          <p className="viz-field-value">{dados.tempo_leitura || '—'}</p>
        </div>
        <div className="viz-field">
          <label>Total de palavras</label>
          <p className="viz-field-value">{dados.total_palavras || '—'}</p>
        </div>
        <div className="viz-field">
          <label>Data detectada</label>
          <p className="viz-field-value">{dados.data_publicacao || '—'}</p>
        </div>
      </div>
    </div>
  );
}

function VisualizacaoCurso({ dados }) {
  return (
    <div className="viz-simple">
      <div className="viz-field">
        <label>Nome do curso</label>
        <p className="viz-field-value title">{dados.nome_curso || '—'}</p>
      </div>
      <div className="viz-row">
        <div className="viz-field">
          <label>Campus</label>
          <p className="viz-field-value">{dados.campus || '—'}</p>
        </div>
        <div className="viz-field">
          <label>Turno</label>
          <p className="viz-field-value">{dados.turno || '—'}</p>
        </div>
        <div className="viz-field">
          <label>Modalidade</label>
          <p className="viz-field-value">{dados.modalidade || '—'}</p>
        </div>
        <div className="viz-field">
          <label>Duração</label>
          <p className="viz-field-value">{dados.duracao || '—'}</p>
        </div>
        <div className="viz-field">
          <label>Grau</label>
          <p className="viz-field-value">{dados.grau || '—'}</p>
        </div>
      </div>
      <div className="viz-field">
        <label>Descrição</label>
        <p className="viz-field-value">{dados.descricao || '—'}</p>
      </div>
    </div>
  );
}

function VisualizacaoTexto({ dados }) {
  return (
    <div className="viz-simple">
      <div className="viz-field">
        <label>Texto estruturado</label>
        <pre className="viz-text-pre">{dados.conteudo || '—'}</pre>
      </div>
    </div>
  );
}
