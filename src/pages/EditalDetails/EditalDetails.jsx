import { useState, useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { useParams, useNavigate } from "react-router-dom";
import { fetchEditalById } from "../../services/edital";
import { ButtonVoltar } from "../../components";
import "./EditalDetails.css";

function EditalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [edital, setEdital] = useState(null);
  const [loading, setLoading] = useState(true);
  const safeContent = useMemo(
    () => DOMPurify.sanitize(edital?.content || ""),
    [edital?.content]
  );

  useEffect(() => {
    fetchEditalById(id)
      .then(setEdital)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (edital) {
      document.title = `Prepara IF - ${edital.title}`;
    }
  }, [edital]);

  if (loading) {
    return (
      <div className="edict-page-container">
        <p>Carregando edital...</p>
      </div>
    );
  }

  if (!edital) {
    return (
      <div className="edict-page-container">
        <ButtonVoltar />
        <p>Edital não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="edict-page-container">
      <div className="edict-top-nav">
        <ButtonVoltar />
      </div>

      <div className="edict-content-split">
        <div className="edict-left-col">
          <span className="source-info">
            Informações extraídas do Portal do Ifal
          </span>
          <h1 className="edict-title">{edital.title}</h1>
          <p className="read-time-info">
            <span className="green-highlight">Informações sobre o edital</span>{" "}
            - 4min de leitura
          </p>
        </div>

        <div className="edict-right-col">
          <div className="edict-text-content">
            <p>{edital.description}</p>
            {safeContent && (
              <div
                className="edict-html-content mt-6"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
            )}
          </div>

          <div className="action-card">
            <div className="action-card-header">
              <div className="icone-instituto"></div>
              <span className="nome-instituto">IFAL</span>
            </div>

            <h3 className="action-card-title">Fazer Provas anteriores</h3>

            <div className="action-card-footer">
              <span className="course-info">
                Informações públicas no site da instituição
              </span>
              <button
                className="course-button"
                onClick={() => navigate("/provas")}
              >
                Fazer provas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditalDetails;
