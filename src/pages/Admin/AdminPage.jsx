import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocumento } from '../../services/upload';
import { fetchCourses } from '../../services/courses';
import { fetchEditais } from '../../services/edital';
import { fetchExams } from '../../services/exams';
import ButtonVoltar from '../../components/Utils/ButtonVoltar';
import './AdminPage.css';

const TABS = [
  { id: 'prova', label: '📄 Prova', desc: 'Extrai questões, alternativas e imagens' },
  { id: 'edital', label: '📜 Edital', desc: 'Extrai título, descrição e conteúdo' },
  { id: 'curso', label: '🎓 Curso', desc: 'Extrai nome, campus, turno e modalidade' },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [activeTab, setActiveTab] = useState('prova');
  const [inputMode, setInputMode] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [savingDb, setSavingDb] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [result, setResult] = useState(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  const [dbSearchTerm, setDbSearchTerm] = useState('');
  const [dbExams, setDbExams] = useState([]);
  const [dbEditais, setDbEditais] = useState([]);
  const [dbCourses, setDbCourses] = useState([]);

  const [openCategories, setOpenCategories] = useState({
    prova: false,
    edital: false,
    curso: false,
  });

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
  const [resultSubTab, setResultSubTab] = useState('preview'); // 'preview' | 'edicao'

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    const loadAll = async () => {
      try {
        const [courses, editais, exams] = await Promise.all([
          fetchCourses(true),
          fetchEditais(true),
          fetchExams(true),
        ]);
        if (isSubscribed) {
          setDbCourses(courses || []);
          setDbEditais(editais || []);
          setDbExams(exams || []);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do banco:", err);
      }
    };
    loadAll();
    return () => { isSubscribed = false; };
  }, []);

  const normSearch = dbSearchTerm.toLowerCase().trim();
  const filteredExams = dbExams.filter(e => e.title.toLowerCase().includes(normSearch));
  const filteredEditais = dbEditais.filter(e => e.title.toLowerCase().includes(normSearch));
  const filteredCourses = dbCourses.filter(c => c.course.name.toLowerCase().includes(normSearch));

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setDbSearchTerm(term);
    if (term.trim() !== '') {
      const norm = term.toLowerCase().trim();
      setOpenCategories({
        prova: dbExams.some(ex => ex.title.toLowerCase().includes(norm)),
        edital: dbEditais.some(ed => ed.title.toLowerCase().includes(norm)),
        curso: dbCourses.some(c => c.course.name.toLowerCase().includes(norm)),
      });
    } else {
      setOpenCategories({
        prova: false,
        edital: false,
        curso: false,
      });
    }
  };

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

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

  const handleGabaritoSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFileGabarito(selectedFile);
      setMessage({ type: '', text: '' });
    } else if (selectedFile) {
      setMessage({ type: 'error', text: 'Apenas arquivos PDF são aceitos para o gabarito.' });
    }
  };

  const handleGabaritoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleGabaritoSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDropGabarito = (e) => {
    e.preventDefault();
    setIsDraggingGab(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleGabaritoSelect(e.dataTransfer.files[0]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' });
    setResult(null);
    setFile(null);
    setFileGabarito(null);
    setIsEditingExisting(false);
    setFormData({ ano: '', exame_num: '', texto: '', titulo_personalizado: '', instituteName: 'IFAL' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setResult(null);
    setIsEditingExisting(false);

    try {
      if (activeTab === 'prova' && (!formData.ano || !formData.exame_num)) {
        throw new Error('Ano e número do exame são obrigatórios para provas.');
      }

      if (inputMode === 'pdf' && !file) {
        throw new Error('Por favor, selecione um arquivo PDF.');
      }

      if (inputMode === 'text' && !formData.texto.trim()) {
        throw new Error('Por favor, insira o texto para extração.');
      }

      const metadata = {
        ano: formData.ano,
        exame_num: formData.exame_num,
        texto: inputMode === 'text' ? formData.texto : '',
        titulo_personalizado: formData.titulo_personalizado,
        instituteName: formData.instituteName,
        salvar_banco: false,
        file_gabarito: inputMode === 'pdf' ? fileGabarito : null,
      };

      const res = await uploadDocumento(activeTab, inputMode === 'pdf' ? file : null, metadata);

      const msgTexto = res.mensagem || 'Extração concluída com sucesso! Ajuste os campos abaixo se desejar e clique em "Enviar ao Banco".';
      setMessage({ type: 'success', text: msgTexto });
      setResult(res.dados);
      setResultSubTab('preview');

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

  const [editingId, setEditingId] = useState(null);

  const handleSaveToDb = async () => {
    if (!result) return;
    setSavingDb(true);
    setMessage({ type: '', text: '' });
    try {
      if (activeTab === 'prova' && result.questoes) {
        const examPayload = {
          id: isEditingExisting ? editingId : undefined,
          title: formData.titulo_personalizado || result.title || `Prova ${formData.ano || ''} Exame ${formData.exame_num || ''}`.trim(),
          questions: result.questoes.map((q, idx) => ({
            id: q.id || idx + 1,
            number: q.number || q.numero_questao || idx + 1,
            supportText: q.supportText || q.texto_apoio || q.texto_de_apoio || '',
            imageUrl: q.imageUrl || q.imagem_url || q.image || '',
            credits: q.credits || q.creditos || q.source || '',
            options: q.options || q.opcoes || [],
            correctAnswerIndex: (q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) ? q.correctAnswerIndex : (q.gabarito !== undefined ? q.gabarito : null),
            status: q.status || ((q.correctAnswerIndex !== null && q.correctAnswerIndex !== undefined) ? 'VALID' : 'UNKNOWN'),
            answerKey: q.answerKey || null,
            answerKeyStatus: q.answerKeyStatus || (q.status === 'ANNULLED' ? 'ANNULLED' : (q.correctAnswerIndex !== null ? 'ORIGINAL' : 'UNKNOWN')),
          })),
        };
        await saveExam(examPayload, isEditingExisting, editingId);
      } else if (activeTab === 'edital' && result.edital) {
        const editalPayload = {
          id: isEditingExisting ? editingId : undefined,
          title: result.edital.title || formData.titulo_personalizado || 'Edital sem título',
          description: result.edital.description || '',
          content: result.edital.content || '',
          time: result.edital.time || 'Avisos e Editais',
          courses: result.edital.courses || [],
        };
        await saveEdital(editalPayload, isEditingExisting, editingId);
      } else if (activeTab === 'curso' && result.course) {
        const coursePayload = {
          id: isEditingExisting ? editingId : undefined,
          title: result.course.title || formData.titulo_personalizado || 'Curso sem nome',
          description: result.course.description || '',
          campus: result.course.campus || '',
          shift: result.course.shift || '',
          modality: result.course.modality || '',
          duration: result.course.duration || '',
          degree: result.course.degree || '',
          instituteName: formData.instituteName || 'IFAL',
          editals: result.course.editals || [],
        };
        await saveCourse(coursePayload, isEditingExisting, editingId);
      } else {
        const metadata = {
          ano: formData.ano,
          exame_num: formData.exame_num,
          texto: inputMode === 'text' ? formData.texto : '',
          titulo_personalizado: formData.titulo_personalizado,
          instituteName: formData.instituteName,
          salvar_banco: true,
        };
        await uploadDocumento(activeTab, inputMode === 'pdf' ? file : null, metadata);
      }

      const [courses, editais, exams] = await Promise.all([
        fetchCourses(true),
        fetchEditais(true),
        fetchExams(true),
      ]);
      setDbCourses(courses || []);
      setDbEditais(editais || []);
      setDbExams(exams || []);
      setMessage({
        type: 'success',
        text: `✅ ${isEditingExisting ? 'Registro atualizado' : 'Registro salvo'} com sucesso no Banco de Dados!`,
      });
    } catch (err) {
      console.error("Erro ao salvar no banco:", err);
      setMessage({ type: 'error', text: err.message || "Erro ao salvar no banco de dados." });
    } finally {
      setSavingDb(false);
    }
  };

  const updateQuestionField = (qIdx, field, value) => {
    setResult((prev) => {
      if (!prev || !prev.questoes) return prev;
      const newQuestoes = [...prev.questoes];
      newQuestoes[qIdx] = { ...newQuestoes[qIdx], [field]: value };
      return { ...prev, questoes: newQuestoes };
    });
  };

  const updateQuestionText = (index, newText) => {
    updateQuestionField(index, 'text', newText);
  };

  const updateQuestionOption = (qIdx, oIdx, newOptText) => {
    setResult(prev => {
      if (!prev || !prev.questoes) return prev;
      const newQuestoes = [...prev.questoes];
      const newOptions = [...(newQuestoes[qIdx].options || [])];
      newOptions[oIdx] = newOptText;
      newQuestoes[qIdx] = { ...newQuestoes[qIdx], options: newOptions };
      return { ...prev, questoes: newQuestoes };
    });
  };

  const addQuestionOption = (qIdx) => {
    setResult((prev) => {
      if (!prev || !prev.questoes) return prev;
      const newQuestoes = [...prev.questoes];
      const currentOpts = newQuestoes[qIdx].options || [];
      const newLetter = String.fromCharCode(65 + currentOpts.length);
      newQuestoes[qIdx] = {
        ...newQuestoes[qIdx],
        options: [...currentOpts, `Alternativa ${newLetter}`],
      };
      return { ...prev, questoes: newQuestoes };
    });
  };

  const removeQuestionOption = (qIdx, oIdx) => {
    setResult((prev) => {
      if (!prev || !prev.questoes) return prev;
      const newQuestoes = [...prev.questoes];
      const currentOpts = newQuestoes[qIdx].options || [];
      if (currentOpts.length <= 2) return prev;
      const newOptions = currentOpts.filter((_, idx) => idx !== oIdx);

      let currentCorrect = newQuestoes[qIdx].correctAnswerIndex;
      let newCorrect = currentCorrect;

      if (Number.isInteger(currentCorrect)) {
        if (oIdx === currentCorrect) {
          newCorrect = null;
        } else if (oIdx < currentCorrect) {
          newCorrect = currentCorrect - 1;
        }
        if (newCorrect !== null && newCorrect >= newOptions.length) {
          newCorrect = newOptions.length - 1;
        }
      } else {
        newCorrect = null;
      }

      newQuestoes[qIdx] = { ...newQuestoes[qIdx], options: newOptions, correctAnswerIndex: newCorrect };
      return { ...prev, questoes: newQuestoes };
    });
  };

  const updateQuestionGabarito = (qIdx, newGabaritoIndex, newStatus) => {
    setResult(prev => {
      if (!prev || !prev.questoes) return prev;
      const newQuestoes = [...prev.questoes];
      const charArray = ['A', 'B', 'C', 'D', 'E'];

      let status = newStatus;
      if (!status) {
        if (newGabaritoIndex === null || newGabaritoIndex === undefined) {
          status = 'UNKNOWN';
        } else {
          status = 'VALID';
        }
      }

      newQuestoes[qIdx] = {
        ...newQuestoes[qIdx],
        correctAnswerIndex: newGabaritoIndex,
        answerKey: newGabaritoIndex !== null ? (charArray[newGabaritoIndex] || null) : null,
        status: status,
        answerKeyStatus: status === 'ANNULLED' ? 'ANNULLED' : (status === 'UNKNOWN' ? 'UNKNOWN' : 'ORIGINAL')
      };
      return { ...prev, questoes: newQuestoes };
    });
  };

  const addQuestion = () => {
    setResult((prev) => {
      const currentQ = prev?.questoes || [];
      const newQ = {
        id: currentQ.length + 1,
        texto_apoio: '',
        imagem_url: '',
        creditos: '',
        text: '',
        options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
        correctAnswerIndex: null,
        status: 'UNKNOWN',
        answerKeyStatus: 'UNKNOWN',
      };
      return { ...prev, questoes: [...currentQ, newQ] };
    });
  };

  const removeQuestion = (qIdx) => {
    setResult((prev) => {
      if (!prev || !prev.questoes) return prev;
      const newQuestoes = prev.questoes.filter((_, idx) => idx !== qIdx);
      return { ...prev, questoes: newQuestoes };
    });
  };

  const updateEditalField = (field, value) => {
    setResult(prev => {
      if (!prev || !prev.edital) return prev;
      return { ...prev, edital: { ...prev.edital, [field]: value } };
    });
  };

  const toggleEditalCourse = (courseId) => {
    setResult((prev) => {
      if (!prev || !prev.edital) return prev;
      const currentCourses = prev.edital.courses || [];
      const exists = currentCourses.includes(courseId);
      const updated = exists
        ? currentCourses.filter((id) => id !== courseId)
        : [...currentCourses, courseId];
      return { ...prev, edital: { ...prev.edital, courses: updated } };
    });
  };

  const updateCourseField = (field, value) => {
    setResult(prev => {
      if (!prev || !prev.course) return prev;
      return { ...prev, course: { ...prev.course, [field]: value } };
    });
  };

  const toggleCourseEdital = (editalId) => {
    setResult((prev) => {
      if (!prev || !prev.course) return prev;
      const currentEditals = prev.course.editals || [];
      const exists = currentEditals.includes(editalId);
      const updated = exists
        ? currentEditals.filter((id) => id !== editalId)
        : [...currentEditals, editalId];
      return { ...prev, course: { ...prev.course, editals: updated } };
    });
  };

  const handleEditExam = (item) => {
    setActiveTab('prova');
    setIsEditingExisting(true);
    setEditingId(item.id);
    setFormData({
      ano: item.title.match(/\d{4}/)?.[0] || '',
      exame_num: item.title.match(/exame\s*(\d+)/i)?.[1] || '01',
      texto: '',
      titulo_personalizado: item.title,
      instituteName: 'IFAL',
    });
    setResult({ id: item.id, title: item.title, questoes: item.questions || [] });
    setMessage({ type: 'success', text: `Prova "${item.title}" carregada do banco.` });
  };

  const handleEditEdital = (item) => {
    setActiveTab('edital');
    setIsEditingExisting(true);
    setEditingId(item.id);
    setFormData({
      ano: '',
      exame_num: '',
      texto: '',
      titulo_personalizado: item.title,
      instituteName: 'IFAL',
    });
    setResult({ edital: { ...item } });
    setMessage({ type: 'success', text: `Edital "${item.title}" carregado do banco.` });
  };

  const handleEditCourse = (item) => {
    setActiveTab('curso');
    setIsEditingExisting(true);
    setEditingId(item.id);
    setFormData({
      ano: '',
      exame_num: '',
      texto: '',
      titulo_personalizado: item.course.name,
      instituteName: item.institute?.name || 'IFAL',
    });
    setResult({
      course: {
        id: item.id,
        title: item.course.name,
        description: item.course.description,
        campus: item.course.campus,
        shift: item.course.turno,
        modality: item.course.specs?.modalidade || 'Presencial',
        duration: item.course.specs?.duracao || '4 anos',
        degree: item.course.specs?.titulo || 'Técnico / Bacharel',
        editals: item.course.editals || item.course.edicts || [],
      }
    });
    setMessage({ type: 'success', text: `Curso "${item.course.name}" carregado do banco.` });
  };

  const activeTabInfo = TABS.find(t => t.id === activeTab) || {
    id: 'editar',
    label: '✏️ Editar Registros',
    desc: 'Consulte e edite dados cadastrados no banco'
  };

  if (isMobile) {
    return (
      <div className="admin-page mobile-restricted-page">
        <div className="admin-top-bar">
          <ButtonVoltar />
        </div>

        <div className="admin-mobile-restricted">
          <div className="restricted-card">
            <div className="restricted-badge">
              <span className="badge-dot" />
              Telas Maiores Requeridas
            </div>

            <div className="restricted-icon-wrapper">
              <span className="restricted-icon">💻</span>
            </div>

            <h2>Painel Indisponível em Celulares</h2>
            <p>
              O sistema de extração de PDFs e gerenciamento de banco do <strong>PreparaIF</strong> foi projetado exclusivamente para uso em computadores.
            </p>

            <div className="restricted-features">
              <div className="feature-chip">
                <span>📄 Extração Avançada de PDFs & Textos</span>
              </div>
              <div className="feature-chip">
                <span>✏️ Edição de Provas, Cursos e Editais</span>
              </div>
            </div>

            <p className="restricted-sub">
              Por favor, acesse através de um computador para utilizar o painel administrativo.
            </p>

            <button className="btn-back-home" onClick={() => navigate('/')}>
              <span>🏠 Voltar para a Página Inicial</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-top-bar">
        <ButtonVoltar />
      </div>
      <div className="admin-hero">
        <span className="admin-badge">Painel de Extração</span>
        <h1 className="admin-title">Processamento e Extração de Documentos</h1>
        <p className="admin-subtitle">
          Envie PDFs ou textos para extração automatizada, ou gerencie registros existentes do banco de dados.
        </p>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="sidebar-label">Extração de Arquivos</p>
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

          <p className="sidebar-label">Gerenciamento</p>
          <button
            className={`sidebar-tab ${activeTab === 'editar' ? 'active' : ''}`}
            onClick={() => handleTabChange('editar')}
          >
            <span className="sidebar-tab-label">✏️ Editar Registros</span>
            <span className="sidebar-tab-desc">Consulte e edite dados do banco</span>
          </button>
        </aside>

        <main className="admin-main">
          {message.text && (
            <div className={`admin-alert ${message.type}`}>
              {message.type === 'success' ? '✅' : '❌'} {message.text}
            </div>
          )}

          {activeTab === 'editar' ? (
            <div className="admin-form-card">
              <div className="form-card-header">
                <h2>✏️ Registros do Banco de Dados</h2>
                <span className="form-card-hint">
                  Clique na categoria para expandir ou digite na pesquisa para filtrar automaticamente.
                </span>
              </div>

              <div className="manage-search-container">
                <input
                  type="text"
                  className="manage-search-input"
                  placeholder="🔍 Digite para pesquisar por título, ano ou instituição..."
                  value={dbSearchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div className="manage-categories-grid">
                <div className="manage-category-card">
                  <button
                    type="button"
                    className={`category-header-btn ${openCategories.prova ? 'open' : ''}`}
                    onClick={() => toggleCategory('prova')}
                  >
                    <h3>📄 Provas Cadastradas <span className="category-count">({filteredExams.length})</span></h3>
                    <span className="category-arrow">{openCategories.prova ? '▲' : '▼'}</span>
                  </button>

                  {openCategories.prova && (
                    <div className="category-items-list">
                      {filteredExams.length === 0 ? (
                        <p className="empty-category-text">Nenhuma prova encontrada.</p>
                      ) : (
                        filteredExams.map(ex => (
                          <div key={ex.id} className="manage-item-row">
                            <div className="item-main-info">
                              <span className="item-title">{ex.title}</span>
                              <span className="item-meta">{ex.questions?.length || 0} questões cadastradas</span>
                            </div>
                            <button
                              type="button"
                              className="btn-edit-item"
                              onClick={() => handleEditExam(ex)}
                              title="Editar esta prova"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              <span>Editar</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="manage-category-card">
                  <button
                    type="button"
                    className={`category-header-btn ${openCategories.edital ? 'open' : ''}`}
                    onClick={() => toggleCategory('edital')}
                  >
                    <h3>📜 Editais Cadastrados <span className="category-count">({filteredEditais.length})</span></h3>
                    <span className="category-arrow">{openCategories.edital ? '▲' : '▼'}</span>
                  </button>

                  {openCategories.edital && (
                    <div className="category-items-list">
                      {filteredEditais.length === 0 ? (
                        <p className="empty-category-text">Nenhum edital encontrado.</p>
                      ) : (
                        filteredEditais.map(ed => (
                          <div key={ed.id} className="manage-item-row">
                            <div className="item-main-info">
                              <span className="item-title">{ed.title}</span>
                              {ed.description && <span className="item-meta">{ed.description.slice(0, 70)}...</span>}
                            </div>
                            <button
                              type="button"
                              className="btn-edit-item"
                              onClick={() => handleEditEdital(ed)}
                              title="Editar este edital"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              <span>Editar</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="manage-category-card">
                  <button
                    type="button"
                    className={`category-header-btn ${openCategories.curso ? 'open' : ''}`}
                    onClick={() => toggleCategory('curso')}
                  >
                    <h3>🎓 Cursos Cadastrados <span className="category-count">({filteredCourses.length})</span></h3>
                    <span className="category-arrow">{openCategories.curso ? '▲' : '▼'}</span>
                  </button>

                  {openCategories.curso && (
                    <div className="category-items-list">
                      {filteredCourses.length === 0 ? (
                        <p className="empty-category-text">Nenhum curso encontrado.</p>
                      ) : (
                        filteredCourses.map(c => (
                          <div key={c.id} className="manage-item-row">
                            <div className="item-main-info">
                              <span className="item-title">{c.course.name}</span>
                              <span className="item-meta">{c.course.campus} · {c.course.turno}</span>
                            </div>
                            <button
                              type="button"
                              className="btn-edit-item"
                              onClick={() => handleEditCourse(c)}
                              title="Editar este curso"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              <span>Editar</span>
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form className="admin-form-card" onSubmit={handleSubmit}>
              <div className="form-card-header">
                <div className="form-card-header-main">
                  <div>
                    <h2>
                      {isEditingExisting ? `✏️ Edição de ${activeTabInfo.label}` : activeTabInfo.label}
                    </h2>
                    <span className="form-card-hint">
                      {isEditingExisting
                        ? 'Edite as informações abaixo e clique em "Salvar Alterações no Banco".'
                        : activeTabInfo.desc}
                    </span>
                  </div>
                  {isEditingExisting ? (
                    <button
                      type="button"
                      className="btn-cancel-edit"
                      onClick={() => {
                        setIsEditingExisting(false);
                        setResult(null);
                        setMessage({ type: '', text: '' });
                      }}
                      title="Cancelar edição e voltar para novo upload"
                    >
                      ❌ Cancelar Edição
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`btn-save-db ${result ? 'active' : ''}`}
                      disabled={!result || savingDb}
                      onClick={handleSaveToDb}
                      title={result ? "Salvar dados no Banco de Dados" : "Extraia um documento primeiro para habilitar o envio ao banco"}
                    >
                      {savingDb ? (
                        <>
                          <span className="spinner-sm" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                          <span>Enviar ao Banco</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isEditingExisting && (
                <>
                  <div className="input-mode-switch-container">
                    <div className="input-mode-switch">
                      <button
                        type="button"
                        className={`switch-option ${inputMode === 'pdf' ? 'active' : ''}`}
                        onClick={() => { setInputMode('pdf'); setMessage({ type: '', text: '' }); }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>Enviar PDF para extração</span>
                      </button>
                      <button
                        type="button"
                        className={`switch-option ${inputMode === 'text' ? 'active' : ''}`}
                        onClick={() => { setInputMode('text'); setMessage({ type: '', text: '' }); }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>Enviar Texto para extração</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

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

              {!isEditingExisting && (
                <>
                  {inputMode === 'pdf' ? (
                    activeTab === 'prova' ? (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Arquivo PDF da Prova *</label>
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
                              <div className="drop-zone-empty compact">
                                <span className="drop-zone-icon-sm">📁</span>
                                <div>
                                  <p className="drop-zone-text-sm">Arraste o PDF da Prova aqui ou clique para procurar</p>
                                  <p className="drop-zone-hint">Suporte a PDFs de até 50 MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="form-group">
                          <label>PDF do Gabarito <span className="label-optional">(opcional)</span></label>
                          <div
                            className={`drop-zone ${isDraggingGab ? 'dragging' : ''} ${fileGabarito ? 'has-file' : ''}`}
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
                                <span className="drop-zone-icon-sm">📁</span>
                                <div>
                                  <p className="drop-zone-text-sm">Arraste o PDF do Gabarito aqui ou clique para procurar</p>
                                  <p className="drop-zone-hint">Opcional — vincula as respostas automáticas</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label>Arquivo PDF do {activeTab === 'edital' ? 'Edital' : 'Curso'} *</label>
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
                              <p className="drop-zone-text">
                                Arraste o PDF do {activeTab === 'edital' ? 'Edital' : 'Curso'} aqui ou clique para procurar
                              </p>
                              <p className="drop-zone-hint">Suporte a PDFs de até 50 MB</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="form-group">
                      <label>Texto para Extração *</label>
                      <textarea
                        name="texto"
                        className="admin-textarea"
                        placeholder={`Cole aqui o conteúdo completo ${activeTab === 'prova' ? 'da prova' : activeTab === 'edital' ? 'do edital' : 'do curso'} para processamento automático...`}
                        value={formData.texto}
                        onChange={handleInputChange}
                        rows={10}
                        required
                      />
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Processando com Inteligência Artificial...
                      </>
                    ) : (
                      `🚀 Extrair ${activeTabInfo.label.split(' ')[1] || 'Dados'}`
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {result && activeTab !== 'editar' && (
            <div className="result-card">
              <div className="result-header">
                <div className="result-subtabs-group">
                  <button
                    type="button"
                    className={`result-subtab-btn ${resultSubTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setResultSubTab('preview')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>👁️ Preview (Visualização)</span>
                  </button>
                  <button
                    type="button"
                    className={`result-subtab-btn ${resultSubTab === 'edicao' ? 'active' : ''}`}
                    onClick={() => setResultSubTab('edicao')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>✏️ Edição (Ajustar Dados)</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-save-db active"
                  disabled={savingDb}
                  onClick={handleSaveToDb}
                >
                  {savingDb ? 'Salvando...' : '💾 Salvar Alterações no Banco'}
                </button>
              </div>

              {resultSubTab === 'preview' && (
                <div className="result-preview-content">
                  {result.questoes && (
                    <div className="questions-preview-list">
                      <div className="preview-document-header">
                        <h3 className="preview-doc-title">
                          📄 {result.title || formData.titulo_personalizado || `Prova ${formData.ano || ''}`}
                        </h3>
                        <div className="preview-doc-meta-bar">
                          <span className="meta-badge-green">{result.questoes.length} Questões Extraídas</span>
                          {formData.ano && <span className="meta-badge-gray">Ano: {formData.ano}</span>}
                          {formData.exame_num && <span className="meta-badge-gray">Exame: {formData.exame_num}</span>}
                        </div>
                      </div>

                      {result.questoes.map((q, idx) => {
                        const isAnnulled = q.status === 'ANNULLED' || q.answerKeyStatus === 'ANNULLED';
                        const isUnknown = !isAnnulled && (q.correctAnswerIndex === null || q.correctAnswerIndex === undefined || q.status === 'UNKNOWN');
                        const isChanged = q.answerKeyStatus === 'CHANGED';

                        const correctOptIndex = (q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) ? q.correctAnswerIndex : null;

                        let gabaritoBadgeText = '';
                        let gabaritoBadgeClass = 'preview-gabarito-tag';

                        if (isAnnulled) {
                          gabaritoBadgeText = '⚠ Questão anulada';
                          gabaritoBadgeClass = 'preview-gabarito-tag is-annulled';
                        } else if (isUnknown) {
                          gabaritoBadgeText = '⚠ Gabarito não identificado';
                          gabaritoBadgeClass = 'preview-gabarito-tag is-unknown';
                        } else {
                          const optChar = q.answerKey || (Number.isInteger(correctOptIndex) ? String.fromCharCode(65 + correctOptIndex) : (q.gabarito_letra || '?'));
                          gabaritoBadgeText = `✓ Gabarito: Alternativa ${optChar}${isChanged ? ' (Alterado após recurso)' : ''}`;
                          gabaritoBadgeClass = 'preview-gabarito-tag is-valid';
                        }

                        const opts = (q.options && q.options.length > 0)
                          ? q.options
                          : (q.opcoes && q.opcoes.length > 0)
                          ? q.opcoes
                          : ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
                        const textoEnunciado = q.text || q.enunciado || 'Sem enunciado';

                        return (
                          <div key={idx} className="preview-question-card">
                            <div className="preview-q-header">
                              <span className="preview-q-number">Questão {q.numero || idx + 1}</span>
                              <span className={gabaritoBadgeClass}>
                                {gabaritoBadgeText}
                              </span>
                            </div>

                            {(q.texto_apoio || q.texto_de_apoio || q.text_apoio) && (
                              <div className="preview-support-text">
                                <span className="support-badge">Texto de Apoio</span>
                                <div className="preview-support-body">
                                  {(q.texto_apoio || q.texto_de_apoio || q.text_apoio)
                                    .split('\n\n')
                                    .map((p, pIdx) => (
                                      <p key={pIdx}>{p}</p>
                                    ))}
                                </div>
                              </div>
                            )}

                            {(q.imagem_url || q.image || (q.imagens && q.imagens[0])) && (
                              <div className="preview-q-image-box">
                                <img src={q.imagem_url || q.image || q.imagens[0]} alt={`Figura Questão ${idx + 1}`} onError={(e) => { e.target.style.display = 'none'; }} />
                              </div>
                            )}

                            {(q.creditos || q.source) && (
                              <div className="preview-credits-box">
                                <span className="preview-q-credits">Fonte / Créditos: {q.creditos || q.source}</span>
                              </div>
                            )}

                            <p className="preview-q-text">{textoEnunciado}</p>

                            <div className="preview-options-list">
                              {opts.map((opt, oIdx) => {
                                const isCorrect = !isAnnulled && !isUnknown && oIdx === correctOptIndex;
                                const letter = String.fromCharCode(65 + oIdx);
                                return (
                                  <div key={oIdx} className={`preview-option-item ${isCorrect ? 'correct' : ''}`}>
                                    <span className="preview-opt-letter">{letter}</span>
                                    <span className="preview-opt-text">{opt}</span>
                                    {isCorrect && <span className="preview-opt-check">✓ Resposta Correta</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {result.edital && (
                    <div className="preview-edital-card">
                      <h3 className="preview-doc-title">📄 {result.edital.title || 'Edital Extraído'}</h3>
                      <p className="preview-doc-description">{result.edital.description}</p>
                      {result.edital.content && (
                        <div className="preview-edital-content">
                          <h4>Conteúdo Detalhado</h4>
                          <p>{result.edital.content}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {result.course && (
                    <div className="preview-course-card">
                      <h3 className="preview-doc-title">🎓 {result.course.title || 'Curso Extraído'}</h3>
                      <p className="preview-doc-description">{result.course.description}</p>
                      <div className="preview-course-grid">
                        <div><strong>Campus:</strong> {result.course.campus || 'N/A'}</div>
                        <div><strong>Turno:</strong> {result.course.shift || 'N/A'}</div>
                        <div><strong>Modalidade:</strong> {result.course.modality || 'N/A'}</div>
                        <div><strong>Duração:</strong> {result.course.duration || 'N/A'}</div>
                        <div><strong>Título:</strong> {result.course.degree || 'N/A'}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {resultSubTab === 'edicao' && (
                <div className="result-edicao-content">
                  {result.questoes && (
                    <div className="questions-list">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span className="edit-label">Editar Questões Extraídas:</span>
                        <button
                          type="button"
                          className="btn-add-q"
                          onClick={addQuestion}
                        >
                          ➕ Adicionar Nova Questão
                        </button>
                      </div>

                      {result.questoes.map((q, idx) => (
                        <div key={idx} className="question-item edit-mode-q">
                          <div className="question-item-header q-header-top">
                            <span className="q-number">Questão {idx + 1}</span>
                            <div className="q-gabarito-select-wrapper">
                              <label className="gabarito-label">Gabarito Correto:</label>
                              <select
                                className="gabarito-select-input"
                                value={
                                  q.status === 'ANNULLED' || q.answerKeyStatus === 'ANNULLED'
                                    ? 'ANNULLED'
                                    : (q.correctAnswerIndex !== null && q.correctAnswerIndex !== undefined
                                        ? String(q.correctAnswerIndex)
                                        : '')
                                }
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === 'ANNULLED') {
                                    updateQuestionGabarito(idx, null, 'ANNULLED');
                                  } else if (val === '') {
                                    updateQuestionGabarito(idx, null, 'UNKNOWN');
                                  } else {
                                    updateQuestionGabarito(idx, Number(val), 'VALID');
                                  }
                                }}
                              >
                                <option value="">Sem gabarito (UNKNOWN)</option>
                                <option value="ANNULLED">Questão anulada (ANNULLED)</option>
                                {(q.options || ['Opção A', 'Opção B', 'Opção C', 'Opção D']).map((_, oIdx) => (
                                  <option key={oIdx} value={oIdx}>
                                    Alternativa {String.fromCharCode(65 + oIdx)}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className="btn-remove-q"
                                onClick={() => removeQuestion(idx)}
                                title="Remover esta questão"
                              >
                                🗑️ Remover
                              </button>
                            </div>
                          </div>

                          <div className="edit-q-block">
                            <label className="edit-label">Texto de Apoio / Contexto (opcional):</label>
                            <textarea
                              className="edit-q-textarea"
                              value={q.texto_apoio || q.text_apoio || ''}
                              onChange={e => updateQuestionField(idx, 'texto_apoio', e.target.value)}
                              rows={2}
                              placeholder="Texto de leitura, contextualização ou instrução inicial..."
                            />
                          </div>

                          <div className="form-row" style={{ marginTop: '10px' }}>
                            <div className="edit-q-block" style={{ margin: 0 }}>
                              <label className="edit-label">URL / Caminho da Imagem (opcional):</label>
                              <input
                                type="text"
                                className="edit-option-input"
                                value={q.imagem_url || q.image || ''}
                                onChange={e => updateQuestionField(idx, 'imagem_url', e.target.value)}
                                placeholder="https://exemplo.com/imagem-questao.png"
                              />
                              {(q.imagem_url || q.image) && (
                                <div className="q-img-preview-box">
                                  <img src={q.imagem_url || q.image} alt={`Visualização Q${idx + 1}`} onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                              )}
                            </div>

                            <div className="edit-q-block" style={{ margin: 0 }}>
                              <label className="edit-label">Créditos / Fonte da Figura ou Texto (opcional):</label>
                              <input
                                type="text"
                                className="edit-option-input"
                                value={q.creditos || q.source || ''}
                                onChange={e => updateQuestionField(idx, 'creditos', e.target.value)}
                                placeholder="Ex: Adaptado de IFAL 2024 / Fonte: IBGE"
                              />
                            </div>
                          </div>

                          <div className="edit-q-block" style={{ marginTop: '12px' }}>
                            <label className="edit-label">Enunciado da Questão *:</label>
                            <textarea
                              className="edit-q-textarea"
                              value={q.text || ''}
                              onChange={e => updateQuestionText(idx, e.target.value)}
                              rows={3}
                              placeholder="Digite aqui a pergunta principal da questão..."
                            />
                          </div>

                          {q.options && (
                            <div className="edit-options-list">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="edit-label">Alternativas de Resposta:</label>
                                <button
                                  type="button"
                                  className="btn-add-opt"
                                  onClick={() => addQuestionOption(idx)}
                                >
                                  ➕ Alternativa
                                </button>
                              </div>
                              {q.options.map((opt, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`edit-option-row ${oIdx === q.correctAnswerIndex ? 'is-correct' : ''}`}
                                >
                                  <span className="opt-letter-badge">
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <input
                                    type="text"
                                    className="edit-option-input"
                                    value={opt}
                                    onChange={e => updateQuestionOption(idx, oIdx, e.target.value)}
                                    placeholder={`Alternativa ${String.fromCharCode(65 + oIdx)}...`}
                                  />
                                  {oIdx === q.correctAnswerIndex && (
                                    <span className="correct-tag">✓ Correta</span>
                                  )}
                                  {q.options.length > 2 && (
                                    <button
                                      type="button"
                                      className="btn-remove-opt"
                                      onClick={() => removeQuestionOption(idx, oIdx)}
                                      title="Remover esta alternativa"
                                    >
                                      ✖
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.edital && (
                    <div className="extracted-edital edit-mode-edital">
                      <div className="edit-q-block">
                        <label className="edit-label">Título do Edital *:</label>
                        <input
                          type="text"
                          className="edit-option-input"
                          value={result.edital.title || ''}
                          onChange={e => updateEditalField('title', e.target.value)}
                          placeholder="Ex: Edital nº 01/2025 - Processo Seletivo IFAL"
                        />
                      </div>
                      <div className="edit-q-block" style={{ marginTop: '12px' }}>
                        <label className="edit-label">Informações / Descrição Resumida *:</label>
                        <textarea
                          className="edit-q-textarea"
                          value={result.edital.description || ''}
                          onChange={e => updateEditalField('description', e.target.value)}
                          rows={3}
                          placeholder="Resumo das informações do edital..."
                        />
                      </div>
                      <div className="edit-q-block" style={{ marginTop: '12px' }}>
                        <label className="edit-label">Conteúdo Completo do Edital (HTML / Texto):</label>
                        <textarea
                          className="edit-q-textarea"
                          value={result.edital.content || ''}
                          onChange={e => updateEditalField('content', e.target.value)}
                          rows={8}
                          placeholder="Conteúdo detalhado ou regras do edital..."
                        />
                      </div>
                      <div className="edit-q-block" style={{ marginTop: '16px' }}>
                        <label className="edit-label">Cursos Relacionados:</label>
                        <div className="relations-checklist">
                          {dbCourses.length === 0 ? (
                            <p className="empty-category-text">Nenhum curso disponível para vincular.</p>
                          ) : (
                            dbCourses.map((c) => {
                              const isChecked = (result.edital.courses || []).includes(c.id);
                              return (
                                <label key={c.id} className="relation-checkbox-item">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleEditalCourse(c.id)}
                                  />
                                  <span>{c.course.name} ({c.course.campus})</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.course && (
                    <div className="extracted-course edit-mode-course">
                      <div className="edit-q-block">
                        <label className="edit-label">Nome do Curso *:</label>
                        <input
                          type="text"
                          className="edit-option-input"
                          value={result.course.title || ''}
                          onChange={e => updateCourseField('title', e.target.value)}
                          placeholder="Ex: Técnico em Informática"
                        />
                      </div>
                      <div className="edit-q-block" style={{ marginTop: '12px' }}>
                        <label className="edit-label">Informações Importantes / Descrição *:</label>
                        <textarea
                          className="edit-q-textarea"
                          value={result.course.description || ''}
                          onChange={e => updateCourseField('description', e.target.value)}
                          rows={3}
                          placeholder="Detalhes e objetivos sobre o curso..."
                        />
                      </div>
                      <div className="course-specs-grid" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <div>
                          <label className="edit-label">Campus *:</label>
                          <input
                            type="text"
                            className="edit-option-input"
                            value={result.course.campus || ''}
                            onChange={e => updateCourseField('campus', e.target.value)}
                            placeholder="Ex: Maceió"
                          />
                        </div>
                        <div>
                          <label className="edit-label">Turno *:</label>
                          <input
                            type="text"
                            className="edit-option-input"
                            value={result.course.shift || ''}
                            onChange={e => updateCourseField('shift', e.target.value)}
                            placeholder="Ex: Matutino / Integral"
                          />
                        </div>
                        <div>
                          <label className="edit-label">Modalidade *:</label>
                          <input
                            type="text"
                            className="edit-option-input"
                            value={result.course.modality || ''}
                            onChange={e => updateCourseField('modality', e.target.value)}
                            placeholder="Ex: Presencial"
                          />
                        </div>
                        <div>
                          <label className="edit-label">Duração *:</label>
                          <input
                            type="text"
                            className="edit-option-input"
                            value={result.course.duration || ''}
                            onChange={e => updateCourseField('duration', e.target.value)}
                            placeholder="Ex: 3 anos"
                          />
                        </div>
                        <div>
                          <label className="edit-label">Título Concedido *:</label>
                          <input
                            type="text"
                            className="edit-option-input"
                            value={result.course.degree || ''}
                            onChange={e => updateCourseField('degree', e.target.value)}
                            placeholder="Ex: Técnico de Nível Médio"
                          />
                        </div>
                      </div>

                      <div className="edit-q-block" style={{ marginTop: '16px' }}>
                        <label className="edit-label">Editais Relacionados:</label>
                        <div className="relations-checklist">
                          {dbEditais.length === 0 ? (
                            <p className="empty-category-text">Nenhum edital disponível para vincular.</p>
                          ) : (
                            dbEditais.map((ed) => {
                              const isChecked = (result.course.editals || []).includes(ed.id);
                              return (
                                <label key={ed.id} className="relation-checkbox-item">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleCourseEdital(ed.id)}
                                  />
                                  <span>{ed.title}</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
