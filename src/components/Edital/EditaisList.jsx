import { useState, useEffect } from "react";
import { fetchEditais } from "../../services/edital";
import EditalCard from "./EditalCard";
import LoadingSpinner from "../Utils/LoadingSpinner";
import "./EditalStyle.css";

export default function EditaisList() {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEditais()
      .then(setEditais)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="editais">
      <div className="editais-header">
        <h2 className="editais-section-title">Editais Anteriores</h2>
      </div>

      <div className="editais-container">
        {loading && <LoadingSpinner text="Carregando editais..." />}
        {!loading && editais.length === 0 && (
          <p className="editais-empty">Nenhum edital foi encontrado.</p>
        )}
        {!loading &&
          editais.map((edital) => (
            <EditalCard key={edital.id} edital={edital} />
          ))}
      </div>
    </section>
  );
}