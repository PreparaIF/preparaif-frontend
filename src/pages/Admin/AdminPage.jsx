import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  FileText,
  ScrollText,
  GraduationCap,
  Edit,
  AlertCircle,
  CheckCircle2,
  Search,
  Trash2,
  Plus,
  Save,
  Camera,
  Home,
  Sparkles,
  Database,
  Layers,
  Monitor,
  Check,
  Folder,
  Eye,
  X,
  Target
} from 'lucide-react';
import { uploadDocumento } from '../../services/upload';
import { fetchCourses, saveCourse } from '../../services/courses';
import { fetchEditais, saveEdital } from '../../services/edital';
import { fetchAdminExams, saveExam } from '../../services/exams';
import { fetchPreferences, createPreference, updatePreference, deletePreference } from '../../services/preferences';
import IconPicker, { DynamicIcon } from '../../components/Utils/IconPicker';
import ButtonVoltar from '../../components/Utils/ButtonVoltar';
import './AdminPage.css';

const TABS = [
  { id: 'prova', label: 'Prova', desc: 'Extrai questões, alternativas e imagens', icon: FileText },
  { id: 'edital', label: 'Edital', desc: 'Extrai título, descrição e conteúdo', icon: ScrollText },
  { id: 'curso', label: 'Curso', desc: 'Extrai nome, campus, turno e modalidade', icon: GraduationCap },
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
    instituteName: 'Instituto Federal de Alagoas - Campus Arapiraca',
  });
  const [file, setFile] = useState(null);
  const [fileGabarito, setFileGabarito] = useState(null);
  const [resultSubTab, setResultSubTab] = useState('preview'); // 'preview' | 'edicao'
  const [previewDetailsOpen, setPreviewDetailsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const editIdParam = searchParams.get('editId');

  useEffect(() => {
    if (tabParam && ['prova', 'edital', 'curso', 'gerenciar'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (!editIdParam) return;
    const targetId = Number(editIdParam);
    if (!targetId) return;

    if ((!tabParam || tabParam === 'prova') && dbExams.length > 0) {
      const found = dbExams.find(ex => Number(ex.id) === targetId);
      if (found) {
        handleEditExam(found);
        setActiveTab('prova');
      }
    } else if (tabParam === 'edital' && dbEditais.length > 0) {
      const found = dbEditais.find(ed => Number(ed.id) === targetId);
      if (found) {
        handleEditEdital(found);
        setActiveTab('edital');
      }
    } else if (tabParam === 'curso' && dbCourses.length > 0) {
      const found = dbCourses.find(c => Number(c.id) === targetId);
      if (found) {
        handleEditCourse(found);
        setActiveTab('curso');
      }
    }
  }, [editIdParam, tabParam, dbExams, dbEditais, dbCourses]);

  const [dbPreferences, setDbPreferences] = useState([]);
  const [editingPref, setEditingPref] = useState(null);
  const [prefFormData, setPrefFormData] = useState({ label: '', category: 'AREA', icon: 'Laptop' });
  const [savingPref, setSavingPref] = useState(false);

  const handleSavePreference = async (e) => {
    e.preventDefault();
    if (!prefFormData.label.trim()) return;
    setSavingPref(true);
    try {
      if (editingPref) {
        await updatePreference(editingPref.id, prefFormData);
        setMessage({ type: 'success', text: `Preferência "${prefFormData.label}" atualizada com sucesso!` });
      } else {
        await createPreference(prefFormData);
        setMessage({ type: 'success', text: `Nova preferência "${prefFormData.label}" criada com sucesso!` });
      }
      setEditingPref(null);
      setPrefFormData({ label: '', category: 'AREA', icon: 'Laptop' });
      const prefs = await fetchPreferences();
      setDbPreferences(prefs || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar preferência.' });
    } finally {
      setSavingPref(false);
    }
  };

  const handleEditPref = (pref) => {
    setEditingPref(pref);
    setPrefFormData({ label: pref.label, category: pref.category, icon: pref.icon });
  };

  const handleDeletePref = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta preferência de conteúdo?')) return;
    try {
      await deletePreference(id);
      setMessage({ type: 'success', text: 'Preferência excluída com sucesso!' });
      const prefs = await fetchPreferences();
      setDbPreferences(prefs || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erro ao excluir preferência.' });
    }
  };

  const handleCancelEditPref = () => {
    setEditingPref(null);
    setPrefFormData({ label: '', category: 'AREA', icon: 'Laptop' });
  };

  useEffect(() => {
    let isSubscribed = true;
    const loadAll = async () => {
      try {
        const [courses, editais, exams, prefs] = await Promise.all([
          fetchCourses(true),
          fetchEditais(true),
          fetchAdminExams(),
          fetchPreferences(),
        ]);
        if (isSubscribed) {
          setDbCourses(courses || []);
          setDbEditais(editais || []);
          setDbExams(exams || []);
          setDbPreferences(prefs || []);
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
    setFormData({ ano: '', exame_num: '', texto: '', titulo_personalizado: '', instituteName: 'Instituto Federal de Alagoas - Campus Arapiraca' });
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
      let savedItem = null;
      if (activeTab === 'prova' && result.questoes) {
        const examPayload = {
          title: formData.titulo_personalizado || result.title || `Prova ${formData.ano || ''} Exame ${formData.exame_num || ''}`.trim(),
          year: Number(formData.ano || result.year) || null,
          examType: result.examType || formData.exame_num || null,
          questions: result.questoes.map((q, idx) => ({
            number: q.number || q.numero_questao || idx + 1,
            text: q.text || q.enunciado || q.statement || '',
            supportText: q.supportText || q.texto_apoio || q.texto_de_apoio || '',
            imageUrl: q.imageUrl || q.imagem_url || q.image || '',
            imageUrls: q.imageUrls || q.images || q.imagens || (q.imageUrl || q.imagem_url || q.image ? [q.imageUrl || q.imagem_url || q.image] : []),
            credits: q.credits || q.creditos || q.source || '',
            options: q.options || q.opcoes || [],
            correctAnswerIndex: (q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) ? q.correctAnswerIndex : (q.gabarito !== undefined ? q.gabarito : null),
            status: q.status || ((q.correctAnswerIndex !== null && q.correctAnswerIndex !== undefined) ? 'VALID' : 'UNKNOWN'),
            answerKey: q.answerKey || null,
            answerKeyStatus: q.answerKeyStatus || (q.status === 'ANNULLED' ? 'ANNULLED' : (q.correctAnswerIndex !== null ? 'ORIGINAL' : 'UNKNOWN')),
          })),
        };
        savedItem = await saveExam(examPayload, isEditingExisting, editingId);
      } else if (activeTab === 'edital' && result.edital) {
        const editalPayload = {
          title: result.edital.title || formData.titulo_personalizado || 'Edital sem título',
          description: result.edital.description || '',
          content: result.edital.content || '',
          time: result.edital.time || 'Avisos e Editais',
          instituteName: result.edital.instituteName || formData.instituteName || 'Instituto Federal de Alagoas - Campus Arapiraca',
          instituteLogo: result.edital.instituteLogo || '',
          courseId: result.edital.courses?.[0] || result.edital.courseId || null,
        };
        savedItem = await saveEdital(editalPayload, isEditingExisting, editingId);
      } else if (activeTab === 'curso' && result.course) {
        const coursePayload = {
          title: result.course.title || formData.titulo_personalizado || 'Curso sem nome',
          description: result.course.description || '',
          campus: result.course.campus || '',
          shift: result.course.shift || '',
          modality: result.course.modality || '',
          duration: result.course.duration || '',
          degree: result.course.degree || '',
          image: result.course.image || result.course.imagem_url || '',
          instituteLogo: result.course.instituteLogo || result.course.logo || '',
          instituteName: formData.instituteName || 'Instituto Federal de Alagoas - Campus Arapiraca',
          editals: result.course.editals || [],
        };
        savedItem = await saveCourse(coursePayload, isEditingExisting, editingId);
      } else {
        const metadata = {
          ano: formData.ano,
          exame_num: formData.exame_num,
          texto: inputMode === 'text' ? formData.texto : '',
          titulo_personalizado: formData.titulo_personalizado,
          instituteName: formData.instituteName,
          salvar_banco: true,
        };
        savedItem = await uploadDocumento(activeTab, inputMode === 'pdf' ? file : null, metadata);
      }

      if (savedItem && (savedItem.id || savedItem.course?.id || savedItem.edital?.id)) {
        const targetId = savedItem.id || savedItem.course?.id || savedItem.edital?.id;
        setIsEditingExisting(true);
        setEditingId(targetId);
      }

      const [courses, editais, exams] = await Promise.all([
        fetchCourses(true),
        fetchEditais(true),
        fetchAdminExams(),
      ]);
      setDbCourses(courses || []);
      setDbEditais(editais || []);
      setDbExams(exams || []);
      setMessage({
        type: 'success',
        text: `${isEditingExisting ? 'Registro atualizado' : 'Registro salvo'} com sucesso no Banco de Dados!`,
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
      const updated = exists ? [] : [courseId];
      return { ...prev, edital: { ...prev.edital, courses: updated } };
    });
  };

  const updateCourseField = (field, value) => {
    setResult(prev => {
      if (!prev || !prev.course) return prev;
      return { ...prev, course: { ...prev.course, [field]: value } };
    });
  };

  const handleImageFileUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        callback(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCourseEdital = (editalId) => {
    setResult((prev) => {
      if (!prev || !prev.course) return prev;
      const currentEditals = (prev.course.editals || []).map((edital) =>
        typeof edital === 'object' ? edital.id : edital
      );
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
      ano: item.year || item.title.match(/\d{4}/)?.[0] || '',
      exame_num: item.examType || item.title.match(/exame\s*(\d+)/i)?.[1] || '01',
      texto: '',
      titulo_personalizado: item.title,
      instituteName: 'Instituto Federal de Alagoas - Campus Arapiraca',
    });
    setResult({
      id: item.id,
      title: item.title,
      year: item.year,
      examType: item.examType,
      questoes: item.questions || [],
    });
    setMessage({ type: 'success', text: `Prova "${item.title}" carregada do banco.` });
  };

  const handleEditEdital = (item) => {
    setActiveTab('edital');
    setIsEditingExisting(true);
    setEditingId(item.id);
    const editalTitle = item.title || 'Edital sem título';
    const editalLogo = item.instituteLogo || item.logo || item.image || '';
    setFormData({
      ano: '',
      exame_num: '',
      texto: '',
      titulo_personalizado: editalTitle,
      instituteName: item.instituteName || 'Instituto Federal de Alagoas - Campus Arapiraca',
    });
    setResult({
      edital: {
        ...item,
        title: editalTitle,
        instituteLogo: editalLogo,
        courses: item.courseId ? [item.courseId] : (item.courses ? item.courses.map(c => typeof c === 'object' ? c.id : c) : [])
      }
    });
    setMessage({ type: 'success', text: `Edital "${editalTitle}" carregado do banco.` });
  };

  const handleEditCourse = (item) => {
    setActiveTab('curso');
    setIsEditingExisting(true);
    setEditingId(item.id);
    const courseTitle = item.title || item.course?.name || item.course?.title || '';
    const courseDescription = item.description || item.course?.description || '';
    const courseCampus = item.campus || item.course?.campus || '';
    const courseShift = item.shift || item.course?.turno || item.course?.shift || '';
    const courseModality = item.modality || item.course?.specs?.modalidade || item.course?.modality || 'Presencial';
    const courseDuration = item.duration || item.course?.specs?.duracao || item.course?.duration || '';
    const courseDegree = item.degree || item.course?.specs?.titulo || item.course?.degree || '';
    const courseImage = item.image || item.imagem_url || item.course?.image || item.course?.imagem_url || '';

    setFormData({
      ano: '',
      exame_num: '',
      texto: '',
      titulo_personalizado: courseTitle,
      instituteName: item.instituteName || item.institute?.name || 'Instituto Federal de Alagoas - Campus Arapiraca',
    });
    setResult({
      course: {
        id: item.id,
        title: courseTitle,
        description: courseDescription,
        campus: courseCampus,
        shift: courseShift,
        modality: courseModality,
        duration: courseDuration,
        degree: courseDegree,
        image: courseImage,
        editals: (item.editals || item.course?.editals || item.course?.edicts || []).map((edital) =>
          typeof edital === 'object' ? edital.id : edital
        ),
      }
    });
    setMessage({ type: 'success', text: `Curso "${courseTitle}" carregado do banco.` });
  };

  const activeTabInfo = TABS.find(t => t.id === activeTab) || {
    id: 'editar',
    label: 'Editar Registros',
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
              <Monitor size={32} color="#00875F" />
            </div>

            <h2>Painel Indisponível em Celulares</h2>
            <p>
              O sistema de extração de PDFs e gerenciamento de banco do <strong>PreparaIF</strong> foi projetado exclusivamente para uso em computadores.
            </p>

            <div className="restricted-features">
              <div className="feature-chip">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Extração Avançada de PDFs & Textos</span>
              </div>
              <div className="feature-chip">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Edit size={16} /> Edição de Provas, Cursos e Editais</span>
              </div>
            </div>

            <p className="restricted-sub">
              Por favor, acesse através de um computador para utilizar o painel administrativo.
            </p>

            <button className="btn-back-home" onClick={() => navigate('/')}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Home size={16} /> Voltar para a Página Inicial</span>
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
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="sidebar-tab-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={18} /> {tab.label}
                </span>
                <span className="sidebar-tab-desc">{tab.desc}</span>
              </button>
            );
          })}

          <div className="sidebar-divider" />

          <p className="sidebar-label">Gerenciamento</p>
          <button
            className={`sidebar-tab ${activeTab === 'editar' ? 'active' : ''}`}
            onClick={() => handleTabChange('editar')}
          >
            <span className="sidebar-tab-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Edit size={18} /> Editar Registros
            </span>
            <span className="sidebar-tab-desc">Consulte e edite dados do banco</span>
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'preferencias' ? 'active' : ''}`}
            onClick={() => handleTabChange('preferencias')}
          >
            <span className="sidebar-tab-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} /> Preferências de Conteúdo
            </span>
            <span className="sidebar-tab-desc">Crie e edite opções e ícones</span>
          </button>
        </aside>

        <main className="admin-main">
          {message.text && (
            <div className={`admin-alert ${message.type}`}>
              {message.type === 'success' ? <CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> : <AlertCircle size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />} {message.text}
            </div>
          )}

          {activeTab === 'preferencias' && (
            <div className="admin-form-card">
              <div className="form-card-header">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={22} color="#00875F" /> Gerenciar Preferências de Conteúdo
                </h2>
                <span className="form-card-hint">
                  Adicione ou edite os temas e modalidades de ensino disponíveis para os estudantes. Escolha o ícone ideal para cada preferência.
                </span>
              </div>

              {/* Form to Create / Edit Preference */}
              <form onSubmit={handleSavePreference} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 14px', color: '#0f172a' }}>
                  {editingPref ? `Editar Preferência: "${editingPref.label}"` : 'Adicionar Nova Preferência'}
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label className="edit-label">Nome / Título da Preferência *:</label>
                    <input
                      type="text"
                      className="edit-option-input"
                      value={prefFormData.label}
                      onChange={(e) => setPrefFormData({ ...prefFormData, label: e.target.value })}
                      placeholder="Ex: Robótica & Automação"
                      required
                    />
                  </div>
                  <div>
                    <label className="edit-label">Categoria *:</label>
                    <select
                      className="edit-option-input"
                      value={prefFormData.category}
                      onChange={(e) => setPrefFormData({ ...prefFormData, category: e.target.value })}
                    >
                      <option value="AREA">Área de Conhecimento</option>
                      <option value="MODALIDADE">Modalidade de Ensino</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Icon Library Picker */}
                <IconPicker
                  selectedIcon={prefFormData.icon}
                  onSelectIcon={(icon) => setPrefFormData({ ...prefFormData, icon })}
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  {editingPref && (
                    <button
                      type="button"
                      className="details-close-btn"
                      onClick={handleCancelEditPref}
                    >
                      Cancelar Edição
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-save-db active"
                    disabled={savingPref}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Save size={16} /> {savingPref ? 'Salvando...' : (editingPref ? 'Atualizar Preferência' : 'Criar Preferência')}
                  </button>
                </div>
              </form>

              {/* List of Existing Preferences */}
              <div className="preferences-admin-list">
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px', color: '#0f172a' }}>
                  Preferências Cadastradas ({dbPreferences.length})
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                  {dbPreferences.map((pref) => (
                    <div
                      key={pref.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <DynamicIcon name={pref.icon} size={20} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{pref.label}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
                            {pref.category === 'AREA' ? 'Área de Conhecimento' : 'Modalidade de Ensino'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditPref(pref)}
                          style={{ padding: '6px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          title="Editar preferência"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePref(pref.id)}
                          style={{ padding: '6px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          title="Excluir preferência"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'editar' ? (
            <div className="admin-form-card">
              <div className="form-card-header">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Edit size={22} color="#00875F" /> Registros do Banco de Dados</h2>
                <span className="form-card-hint">
                  Clique na categoria para expandir ou digite na pesquisa para filtrar automaticamente.
                </span>
              </div>

              <div className="manage-search-container">
                <input
                  type="text"
                  className="manage-search-input"
                  placeholder="Digite para pesquisar por título, ano ou instituição..."
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
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={18} /> Provas Cadastradas <span className="category-count">({filteredExams.length})</span></h3>
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
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ScrollText size={18} /> Editais Cadastrados <span className="category-count">({filteredEditais.length})</span></h3>
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
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><GraduationCap size={18} /> Cursos Cadastrados <span className="category-count">({filteredCourses.length})</span></h3>
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
                      {isEditingExisting ? `Edição de ${activeTabInfo.label}` : activeTabInfo.label}
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
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <X size={16} /> Cancelar Edição
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
                    placeholder="Ex: Instituto Federal de Alagoas - Campus Arapiraca"
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
                                <FileText size={24} color="#00875F" />
                                <div>
                                  <p className="drop-zone-filename">{file.name}</p>
                                  <p className="drop-zone-size">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="drop-zone-empty compact">
                                <Folder size={20} color="#00875F" />
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
                                <FileText size={24} color="#00875F" />
                                <div>
                                  <p className="drop-zone-filename">{fileGabarito.name}</p>
                                  <p className="drop-zone-size">
                                    {(fileGabarito.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="drop-zone-empty compact">
                                <Folder size={20} color="#00875F" />
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
                              <FileText size={24} color="#00875F" />
                              <div>
                                <p className="drop-zone-filename">{file.name}</p>
                                <p className="drop-zone-size">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB · Clique para trocar
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="drop-zone-empty">
                              <Folder size={28} color="#00875F" />
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

                  <button type="submit" className="submit-btn" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Processando com Inteligência Artificial...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} /> Extrair {activeTabInfo.label}
                      </>
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
                    <Eye size={16} />
                    <span>Preview (Visualização)</span>
                  </button>
                  <button
                    type="button"
                    className={`result-subtab-btn ${resultSubTab === 'edicao' ? 'active' : ''}`}
                    onClick={() => setResultSubTab('edicao')}
                  >
                    <Edit size={16} />
                    <span>Edição (Ajustar Dados)</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-save-db active"
                  disabled={savingDb}
                  onClick={handleSaveToDb}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} /> {savingDb ? 'Salvando...' : 'Salvar Alterações no Banco'}
                </button>
              </div>

              {resultSubTab === 'preview' && (
                <div className="preview-realistic-wrapper">
                  <div className="preview-realistic-notice">
                    <div className="notice-badge">
                      <Eye size={16} /> Visão Prévia do Aluno (Interativa)
                    </div>
                    <p className="notice-hint">
                      Clique no card abaixo para simular a abertura da tela de detalhes em tempo real.
                    </p>
                  </div>

                  {/* PROVA REALISTIC PREVIEW */}
                  {result.questoes && (
                    <div className="realistic-card-container">
                      <div
                        className={`realistic-exam-card ${previewDetailsOpen ? 'card-expanded' : ''}`}
                        onClick={() => setPreviewDetailsOpen(!previewDetailsOpen)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="realistic-exam-cover">
                          <span className="exam-tag-pill">{formData.ano || result.year || '2025'}</span>
                          <h3 className="exam-cover-title">
                            {result.title || formData.titulo_personalizado || `PROVA IFAL ${formData.ano || '2025'}`}
                          </h3>
                        </div>
                        <div className="realistic-exam-body">
                          <div className="realistic-exam-metas">
                            <span className="meta-pill"><GraduationCap size={14} /> {formData.exame_num ? `Tipo ${formData.exame_num}` : 'Processo Seletivo'}</span>
                            <span className="meta-pill"><FileText size={14} /> {result.questoes.length} Questões</span>
                          </div>
                          <button
                            type="button"
                            className="realistic-card-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDetailsOpen(!previewDetailsOpen);
                            }}
                          >
                            <Eye size={16} />
                            {previewDetailsOpen ? 'Recolher Detalhes da Prova' : 'Ver Detalhes da Prova (Simular Aluno)'}
                          </button>
                        </div>
                      </div>

                      {previewDetailsOpen && (
                        <div className="realistic-details-rectangle animate-slide-down">
                          <div className="details-rectangle-header">
                            <div className="details-header-title">
                              <FileText size={20} color="#00875F" />
                              <div>
                                <h4>Detalhes da Prova — Visão do Estudante</h4>
                                <span className="details-sub-hint">Simulação de gabarito, enunciado, suporte e alternativas</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="details-close-btn"
                              onClick={() => setPreviewDetailsOpen(false)}
                            >
                              <X size={16} /> Recolher
                            </button>
                          </div>

                          <div className="details-rectangle-body">
                            <div className="preview-exam-stats-bar">
                              <div className="stat-box">
                                <span className="stat-num">{result.questoes.length}</span>
                                <span className="stat-lbl">Total de Questões</span>
                              </div>
                              <div className="stat-box valid">
                                <span className="stat-num">{result.questoes.filter(q => q.status === 'VALID' || (q.correctAnswerIndex !== null && q.status !== 'ANNULLED')).length}</span>
                                <span className="stat-lbl">Válidas</span>
                              </div>
                              <div className="stat-box annulled">
                                <span className="stat-num">{result.questoes.filter(q => q.status === 'ANNULLED' || q.answerKeyStatus === 'ANNULLED').length}</span>
                                <span className="stat-lbl">Anuladas</span>
                              </div>
                              <div className="stat-box unknown">
                                <span className="stat-num">{result.questoes.filter(q => (q.status === 'UNKNOWN' || q.correctAnswerIndex === null) && q.status !== 'ANNULLED').length}</span>
                                <span className="stat-lbl">Gabarito Pendente</span>
                              </div>
                            </div>

                            <div className="questions-preview-list">
                              {result.questoes.map((q, idx) => {
                                const isAnnulled = q.status === 'ANNULLED' || q.answerKeyStatus === 'ANNULLED';
                                const isUnknown = !isAnnulled && (q.correctAnswerIndex === null || q.correctAnswerIndex === undefined || q.status === 'UNKNOWN');
                                const isChanged = q.answerKeyStatus === 'CHANGED';

                                const correctOptIndex = (q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) ? q.correctAnswerIndex : null;

                                let gabaritoBadgeText = '';
                                let gabaritoBadgeClass = 'preview-gabarito-tag';

                                if (isAnnulled) {
                                  gabaritoBadgeText = 'Questão anulada';
                                  gabaritoBadgeClass = 'preview-gabarito-tag is-annulled';
                                } else if (isUnknown) {
                                  gabaritoBadgeText = 'Gabarito não identificado';
                                  gabaritoBadgeClass = 'preview-gabarito-tag is-unknown';
                                } else {
                                  const optChar = q.answerKey || (Number.isInteger(correctOptIndex) ? String.fromCharCode(65 + correctOptIndex) : (q.gabarito_letra || '?'));
                                  gabaritoBadgeText = `Gabarito: Alternativa ${optChar}${isChanged ? ' (Alterado após recurso)' : ''}`;
                                  gabaritoBadgeClass = 'preview-gabarito-tag is-valid';
                                }

                                const opts = (q.options && q.options.length > 0)
                                  ? q.options
                                  : (q.opcoes && q.opcoes.length > 0)
                                  ? q.opcoes
                                  : ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
                                const textoEnunciado = q.text || q.enunciado || 'Sem enunciado';
                                const imagensQuestao = [
                                  ...(Array.isArray(q.imageUrls) ? q.imageUrls : []),
                                  ...(Array.isArray(q.images) ? q.images : []),
                                  ...(Array.isArray(q.imagens) ? q.imagens : []),
                                  ...(q.imagem_url || q.imageUrl || q.image ? [q.imagem_url || q.imageUrl || q.image] : []),
                                ].filter((url, imageIndex, all) => typeof url === 'string' && url && all.indexOf(url) === imageIndex);

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

                                    {imagensQuestao.length > 0 && (
                                      <div className="preview-q-images-box">
                                        {imagensQuestao.map((url, imageIndex) => (
                                          <figure className="preview-q-image-box" key={`${idx}-${imageIndex}`}>
                                            <img src={url} alt={`Figura ${imageIndex + 1} da questão ${q.numero || idx + 1}`} onError={(e) => { e.target.style.display = 'none'; }} />
                                          </figure>
                                        ))}
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
                                            {isCorrect && <span className="preview-opt-check"><Check size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Resposta Correta</span>}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* EDITAL REALISTIC PREVIEW */}
                  {result.edital && (
                    <div className="realistic-card-container">
                      <div
                        className={`realistic-edital-card ${previewDetailsOpen ? 'card-expanded' : ''}`}
                        onClick={() => setPreviewDetailsOpen(!previewDetailsOpen)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="realistic-edital-badge-bar">
                          <span className="edital-pill"><ScrollText size={14} /> Avisos e Editais</span>
                          <span className="edital-inst-pill">{result.edital.instituteName || formData.instituteName || 'IFAL'}</span>
                        </div>
                        <h3 className="realistic-edital-title">
                          {result.edital.title || formData.titulo_personalizado || 'Edital de Processo Seletivo IFAL'}
                        </h3>
                        <p className="realistic-edital-desc">
                          {result.edital.description || 'Publicação de edital oficial para seleção de candidatos.'}
                        </p>
                        <div className="realistic-edital-footer">
                          <span className="edital-date-meta">Postado recentemente</span>
                          <button
                            type="button"
                            className="realistic-card-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDetailsOpen(!previewDetailsOpen);
                            }}
                          >
                            <Eye size={16} />
                            {previewDetailsOpen ? 'Recolher Edital' : 'Ver Edital Completo (Simular Aluno)'}
                          </button>
                        </div>
                      </div>

                      {previewDetailsOpen && (
                        <div className="realistic-details-rectangle animate-slide-down">
                          <div className="details-rectangle-header">
                            <div className="details-header-title">
                              <ScrollText size={20} color="#00875F" />
                              <div>
                                <h4>Página de Detalhes do Edital — Visão do Estudante</h4>
                                <span className="details-sub-hint">{result.edital.title}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="details-close-btn"
                              onClick={() => setPreviewDetailsOpen(false)}
                            >
                              <X size={16} /> Recolher
                            </button>
                          </div>

                          <div className="details-rectangle-body">
                            <div className="edital-detail-banner">
                              <h2 style={{ fontSize: '20px', color: '#111827', margin: '0 0 8px' }}>{result.edital.title}</h2>
                              <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 16px' }}>{result.edital.description}</p>
                            </div>

                            {result.edital.content && (
                              <div className="edital-detail-content-box" style={{ background: '#fafafa', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#111827' }}>Regras e Conteúdo Completo:</h4>
                                <div
                                  className="edict-html-content"
                                  style={{ lineHeight: '1.6', fontSize: '14px' }}
                                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(result.edital.content) }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* COURSE REALISTIC PREVIEW */}
                  {result.course && (
                    <div className="realistic-card-container">
                      <div
                        className={`realistic-course-card ${previewDetailsOpen ? 'card-expanded' : ''}`}
                        onClick={() => setPreviewDetailsOpen(!previewDetailsOpen)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="realistic-course-cover">
                          {(result.course.image || result.course.imagem_url) ? (
                            <img src={result.course.image || result.course.imagem_url} alt={result.course.title} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="realistic-cover-gradient">
                              <GraduationCap size={48} color="rgba(255,255,255,0.4)" />
                            </div>
                          )}
                          <span className="course-shift-pill">{result.course.shift || 'DIURNO'}</span>
                        </div>

                        <div className="realistic-course-body">
                          <div className="course-institute-meta">
                            {(result.course.instituteLogo || result.course.logo) ? (
                              <img src={result.course.instituteLogo || result.course.logo} alt="Logo Instituto" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="inst-icon-avatar">IF</div>
                            )}
                            <span>{formData.instituteName || 'Instituto Federal de Alagoas - Campus Arapiraca'}</span>
                          </div>
                          <h3 className="realistic-course-title">
                            {result.course.title || formData.titulo_personalizado || 'Técnico em Informática'}
                          </h3>
                          <p className="realistic-course-submeta">Informações públicas no site da instituição</p>

                          <button
                            type="button"
                            className="realistic-card-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDetailsOpen(!previewDetailsOpen);
                            }}
                          >
                            <Eye size={16} />
                            {previewDetailsOpen ? 'Recolher Curso' : 'Ver Curso (Simular Aluno)'}
                          </button>
                        </div>
                      </div>

                      {previewDetailsOpen && (
                        <div className="realistic-details-rectangle animate-slide-down">
                          <div className="details-rectangle-header">
                            <div className="details-header-title">
                              <GraduationCap size={20} color="#00875F" />
                              <div>
                                <h4>Página de Detalhes do Curso — Visão do Estudante</h4>
                                <span className="details-sub-hint">{result.course.title}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="details-close-btn"
                              onClick={() => setPreviewDetailsOpen(false)}
                            >
                              <X size={16} /> Recolher
                            </button>
                          </div>

                          <div className="details-rectangle-body">
                            <div className="course-detail-header-card">
                              {(result.course.image || result.course.imagem_url) && (
                                <div className="course-detail-hero-image" style={{ width: '100%', maxHeight: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                                  <img src={result.course.image || result.course.imagem_url} alt={result.course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                              )}
                              <h2 style={{ fontSize: '20px', color: '#111827', margin: '0 0 8px' }}>{result.course.title}</h2>
                              <p className="course-detail-desc" style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 16px', lineHeight: '1.5' }}>{result.course.description}</p>
                              
                              <div className="course-detail-specs-grid">
                                <div className="spec-card">
                                  <span className="spec-label">Campus</span>
                                  <span className="spec-val">{result.course.campus || 'Arapiraca'}</span>
                                </div>
                                <div className="spec-card">
                                  <span className="spec-label">Turno</span>
                                  <span className="spec-val">{result.course.shift || 'Diurno'}</span>
                                </div>
                                <div className="spec-card">
                                  <span className="spec-label">Modalidade</span>
                                  <span className="spec-val">{result.course.modality || 'Presencial'}</span>
                                </div>
                                <div className="spec-card">
                                  <span className="spec-label">Duração</span>
                                  <span className="spec-val">{result.course.duration || '3 anos'}</span>
                                </div>
                                <div className="spec-card">
                                  <span className="spec-label">Título Concedido</span>
                                  <span className="spec-val">{result.course.degree || 'Técnico'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Plus size={16} /> Adicionar Nova Questão
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
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={14} /> Remover
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
                              <label className="edit-label">Imagem / Figura da Questão (Upload ou URL):</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <label className="btn-upload-file" style={{ cursor: 'pointer', padding: '6px 12px', background: '#00875F', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Camera size={14} /> Enviar Imagem
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => handleImageFileUpload(e, (url) => updateQuestionField(idx, 'imagem_url', url))}
                                  />
                                </label>
                                <input
                                  type="text"
                                  className="edit-option-input"
                                  style={{ flex: 1, minWidth: '160px' }}
                                  value={q.imagem_url || q.image || ''}
                                  onChange={e => updateQuestionField(idx, 'imagem_url', e.target.value)}
                                  placeholder="https://exemplo.com/imagem-questao.png"
                                />
                                {(q.imagem_url || q.image) && (
                                  <button
                                    type="button"
                                    onClick={() => updateQuestionField(idx, 'imagem_url', '')}
                                    style={{ background: '#FF4D4D', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                              {(q.imagem_url || q.image) && (
                                <div className="q-img-preview-box" style={{ marginTop: '6px' }}>
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
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Plus size={14} /> Alternativa
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
                                    <span className="correct-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Check size={12} /> Correta</span>
                                  )}
                                  {q.options.length > 2 && (
                                    <button
                                      type="button"
                                      className="btn-remove-opt"
                                      onClick={() => removeQuestionOption(idx, oIdx)}
                                      title="Remover esta alternativa"
                                      style={{ display: 'inline-flex', alignItems: 'center' }}
                                    >
                                      <X size={14} />
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
                      <div className="edit-q-block" style={{ marginTop: '12px' }}>
                        <label className="edit-label">Logo / Imagem do Instituto (Upload ou URL):</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <label className="btn-upload-file" style={{ cursor: 'pointer', padding: '6px 12px', background: '#00875F', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Camera size={14} /> Enviar Logo
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageFileUpload(e, (url) => updateEditalField('instituteLogo', url))}
                            />
                          </label>
                          <input
                            type="text"
                            className="edit-option-input"
                            style={{ flex: 1, minWidth: '160px' }}
                            value={result.edital.instituteLogo || ''}
                            onChange={e => updateEditalField('instituteLogo', e.target.value)}
                            placeholder="https://exemplo.com/logo-instituto.png"
                          />
                          {result.edital.instituteLogo && (
                            <button
                              type="button"
                              onClick={() => updateEditalField('instituteLogo', '')}
                              style={{ background: '#FF4D4D', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {result.edital.instituteLogo && (
                          <div style={{ marginTop: '6px', maxWidth: '120px', maxHeight: '60px' }}>
                            <img src={result.edital.instituteLogo} alt="Logo Prev" style={{ maxHeight: '50px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          </div>
                        )}
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
                      <div className="edit-q-block" style={{ marginTop: '12px' }}>
                        <label className="edit-label">Imagem / Capa do Curso (Upload ou URL):</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <label className="btn-upload-file" style={{ cursor: 'pointer', padding: '6px 12px', background: '#00875F', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Camera size={14} /> Enviar Capa do Curso
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageFileUpload(e, (url) => updateCourseField('image', url))}
                            />
                          </label>
                          <input
                            type="text"
                            className="edit-option-input"
                            style={{ flex: 1, minWidth: '160px' }}
                            value={result.course.image || result.course.imagem_url || ''}
                            onChange={e => updateCourseField('image', e.target.value)}
                            placeholder="https://exemplo.com/capa-curso.png"
                          />
                          {(result.course.image || result.course.imagem_url) && (
                            <button
                              type="button"
                              onClick={() => updateCourseField('image', '')}
                              style={{ background: '#FF4D4D', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {(result.course.image || result.course.imagem_url) && (
                          <div style={{ marginTop: '8px', maxWidth: '220px', maxHeight: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                            <img src={result.course.image || result.course.imagem_url} alt="Preview Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          </div>
                        )}
                      </div>
                      <div className="edit-q-block" style={{ marginTop: '12px' }}>
                        <label className="edit-label">Logo / Imagem do Instituto (Upload ou URL):</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <label className="btn-upload-file" style={{ cursor: 'pointer', padding: '6px 12px', background: '#00875F', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Camera size={14} /> Enviar Logo do Instituto
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageFileUpload(e, (url) => updateCourseField('instituteLogo', url))}
                            />
                          </label>
                          <input
                            type="text"
                            className="edit-option-input"
                            style={{ flex: 1, minWidth: '160px' }}
                            value={result.course.instituteLogo || result.course.logo || ''}
                            onChange={e => updateCourseField('instituteLogo', e.target.value)}
                            placeholder="https://exemplo.com/logo-instituto.png"
                          />
                          {(result.course.instituteLogo || result.course.logo) && (
                            <button
                              type="button"
                              onClick={() => updateCourseField('instituteLogo', '')}
                              style={{ background: '#FF4D4D', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        {(result.course.instituteLogo || result.course.logo) && (
                          <div style={{ marginTop: '8px', maxWidth: '140px', maxHeight: '70px', borderRadius: '8px', overflow: 'hidden', padding: '4px', background: '#fff', border: '1px solid #ddd' }}>
                            <img src={result.course.instituteLogo || result.course.logo} alt="Preview Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          </div>
                        )}
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
