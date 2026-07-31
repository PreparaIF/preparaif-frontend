import { apiUpload } from "./api";

/**
 * @param {string} tipo - 'prova' | 'edital' | 'curso' | 'texto'
 * @param {File|null} file - Arquivo PDF (null para texto livre)
 * @param {object} metadata - Campos adicionais (ano, exame_num, texto, titulo_personalizado, salvar_banco)
 * @returns {Promise<object>} Resposta com { mensagem, dados, salvo, registro_criado }
 */
export async function uploadDocumento(tipo, file, metadata = {}) {
  const formData = new FormData();
  formData.append("tipo", tipo);

  if (file) {
    formData.append("file", file);
  }

  if (metadata.file_gabarito) {
    formData.append("file_gabarito", metadata.file_gabarito);
  }

  if (metadata.ano) formData.append("ano", metadata.ano);
  if (metadata.exame_num) formData.append("exame_num", metadata.exame_num);
  if (metadata.texto) formData.append("texto", metadata.texto);
  if (metadata.titulo_personalizado) formData.append("titulo_personalizado", metadata.titulo_personalizado);
  if (metadata.salvar_banco !== undefined) formData.append("salvar_banco", String(metadata.salvar_banco));
  if (metadata.instituteName) formData.append("instituteName", metadata.instituteName);
  if (metadata.courseId) formData.append("courseId", String(metadata.courseId));

  return await apiUpload("/upload", formData);
}
