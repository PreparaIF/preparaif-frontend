import { useNavigate } from "react-router-dom";
import "./EditalStyle.css";

export default function EditalCard({ edital }) {
  const navigate = useNavigate();

  return (
    <button className="edital-card" onClick={() => navigate(`/edital/${edital.id}`)}>
      <h2>{edital.title}</h2>
      <p>{edital.description}</p>
      <small>{edital.time}</small>
    </button>
  );
}
