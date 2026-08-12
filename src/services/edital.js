import { apiGet, apiPost, apiPut } from "./api";

let editaisCache = null;

function mapEdital(e) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    content: e.content,
    time: e.time,
    courses: e.courses || [],
  };
}

const FALLBACK_EDITAIS = [
  {
    id: 1,
    title: "Edital IFAL 2026 - Cursos Técnicos Integrados",
    description: "Processo Seletivo Unificado para ingresso nos Cursos Técnicos de Nível Médio Integrado ao Ensino Médio.",
    content: "O Instituto Federal de Alagoas torna público a abertura de inscrições para o Processo Seletivo 2026.",
    time: "Inscrições abertas até 30 de Outubro de 2026",
    status: "aberto",
    courses: [],
  },
  {
    id: 2,
    title: "Edital IFAL 2025 - Cursos Subsequentes e Conquista",
    description: "Processo Seletivo destinado a estudantes que já concluíram o Ensino Médio.",
    content: "Vagas para cursos técnicos subsequentes no campus Maceió, Arapiraca e Palmeira dos Índios.",
    time: "Encerrado em 15 de Dezembro de 2025",
    status: "fechado",
    courses: [],
  },
  {
    id: 3,
    title: "Edital IFAL 2025.2 - Cursos Superiores e SISU",
    description: "Vagas remanescentes e seleção via nota do ENEM para cursos de graduação.",
    content: "Seleção para Bacharelado em Sistemas de Informação e Engenharias.",
    time: "Últimos dias de inscrição!",
    status: "ultimos_dias",
    courses: [],
  },
];

export async function fetchEditais(forceRefresh = false) {
  if (editaisCache && !forceRefresh) {
    return editaisCache;
  }
  try {
    const data = await apiGet("/editals");
    editaisCache = data.map(mapEdital);
    return editaisCache;
  } catch (err) {
    console.warn("Erro ao buscar editais do backend, utilizando dados de demonstração:", err);
    editaisCache = FALLBACK_EDITAIS;
    return editaisCache;
  }
}

export async function fetchEditalById(id) {
  if (editaisCache) {
    const found = editaisCache.find((e) => String(e.id) === String(id));
    if (found) return found;
  }
  const data = await apiGet(`/editals/${id}`);
  return mapEdital(data);
}

export function clearEditaisCache() {
  editaisCache = null;
}

export async function saveEdital(editalPayload, isEdit = false, id = null) {
  clearEditaisCache();
  if (isEdit && id) {
    return await apiPut(`/editals/${id}`, editalPayload);
  }
  return await apiPost("/editals", editalPayload);
}