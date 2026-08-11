import { useState, useEffect } from "react";
import { fetchEditais } from "../../services/edital";
import EditalCard from "./EditalCard";
import LoadingSpinner from "../Utils/LoadingSpinner";
import { matchEdital } from "../../utils/searchUtils";
import "./EditalStyle.css";

export default function EditaisList({ searchTerm = "" }) {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEditais()
      .then(setEditais)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredEditais = editais.filter((edital) => matchEdital(edital, searchTerm));

  const isSearching = Boolean(searchTerm.trim());
  if (isSearching && filteredEditais.length === 0) {
    return null;
  }

  return (
    <section className="editais">
      <div className="editais-header">
        <h2 className="editais-section-title">Editais Anteriores</h2>
      </div>

      <div className="editais-container">
        {loading && <LoadingSpinner text="Carregando editais..." />}
        {!loading && filteredEditais.length === 0 && (
          <p className="editais-empty">Nenhum edital foi encontrado.</p>
        )}
        {!loading &&
          filteredEditais.map((edital) => (
            <EditalCard key={edital.id} edital={edital} />
          ))}
      </div>
    </section>
  );
}