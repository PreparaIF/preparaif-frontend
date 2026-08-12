import { apiFetch } from "./api";

export async function uploadDocumento(tipo, file, metadata = {}, token = null) {
  const formData = new FormData();
  formData.append("tipo", tipo);

  if (file) {
    formData.append("file", file);
  }

  if (metadata.file_gabarito) {
    formData.append("file_gabarito", metadata.file_gabarito);
  }

  if (metadata.ano) formData.append("ano", String(metadata.ano));
  if (metadata.exame_num) formData.append("exame_num", String(metadata.exame_num));
  if (metadata.texto) formData.append("texto", metadata.texto);
  if (metadata.titulo_personalizado) formData.append("titulo_personalizado", metadata.titulo_personalizado);
  if (metadata.instituteName) formData.append("instituteName", metadata.instituteName);
  if (metadata.courseId) formData.append("courseId", String(metadata.courseId));
  if (metadata.salvar_banco !== undefined) formData.append("salvar_banco", String(metadata.salvar_banco));

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const data = await apiFetch("/upload", {
      method: "POST",
      headers,
      body: formData,
    });

    const rawDados = data.dados || data;

    // Normalização no cliente para garantir retrocompatibilidade com a UI da AdminPage
    if (rawDados && rawDados.questions && Array.isArray(rawDados.questions)) {
      rawDados.questoes = rawDados.questions.map((q, idx) => {
        const text = q.statement || q.text || q.enunciado || "";
        const options = Array.isArray(q.options) ? q.options : [];
        const correctAnswerIndex = q.correctAnswerIndex ?? null;
        const textoApoio = q.supportText || q.texto_apoio || "";
        const creditos = q.credits || q.creditos || "";

        return {
          ...q,
          id: q.id || q.number || idx + 1,
          numero: q.number || q.numero_questao || idx + 1,
          numero_questao: q.number || q.numero_questao || idx + 1,
          text,
          enunciado: text,
          statement: text,
          options,
          opcoes: options,
          correctAnswerIndex,
          gabarito: correctAnswerIndex,
          status: q.status || (correctAnswerIndex !== null ? "VALID" : "UNKNOWN"),
          gabarito_letra: correctAnswerIndex !== null ? String.fromCharCode(65 + correctAnswerIndex) : "NULA/ANULADA",
          texto_apoio: textoApoio,
          texto_de_apoio: textoApoio,
          supportText: textoApoio,
          imagem_url: q.imageUrl || q.imagem_url || "",
          imageUrl: q.imageUrl || q.imagem_url || "",
          creditos,
          credits: creditos,
        };
      });
    }

    return {
      sucesso: true,
      mensagem: data.mensagem || "Documento processado com sucesso pela API!",
      dados: rawDados,
      salvo: data.salvo || false,
      registro_criado: data.registro_criado || null,
    };
  } catch (error) {
    console.error("Erro na requisição de upload:", error);
    throw new Error(`Falha no envio do documento: ${error.message}`);
  }
}
