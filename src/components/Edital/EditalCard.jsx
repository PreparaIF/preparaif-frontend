import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import "./EditalStyle.css";

export default function EditalCard({ edital }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <div
      className="edital-card"
      onClick={() => navigate(`/edital/${edital.id}`)}
      style={{ position: 'relative', cursor: 'pointer' }}
    >
      <h2>{edital.title}</h2>
      <p>{edital.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <small>{edital.time}</small>
        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin?tab=edital&editId=${edital.id}`);
            }}
            title="Editar este edital"
            style={{ padding: '4px 10px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '11px' }}
          >
            <Edit size={12} /> Editar
          </button>
        )}
      </div>
    </div>
  );
}
