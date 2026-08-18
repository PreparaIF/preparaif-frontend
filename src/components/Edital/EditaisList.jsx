import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { fetchEditais } from "../../services/edital";
import { useAuth } from "../../contexts/auth-context";
import EditalCard from "./EditalCard";
import LoadingSpinner from "../Utils/LoadingSpinner";
import { matchEdital } from "../../utils/searchUtils";
import "./EditalStyle.css";

export default function EditaisList({ searchTerm = "" }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
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
      <div className="editais-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="editais-section-title">Editais Anteriores</h2>
        {isAdmin && (
          <button
            type="button"
            className="admin-add-element-btn"
            onClick={() => navigate('/admin?tab=edital')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#00875F', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
          >
            <Plus size={16} /> Adicionar Edital
          </button>
        )}
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