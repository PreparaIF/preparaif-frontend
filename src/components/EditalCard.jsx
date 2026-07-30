import "./EditalCard.css"
import { useNavigate } from 'react-router-dom';
export default function Edital({ edital }) {
  const navigate = useNavigate();

    const irParaDetalhesEdital = () => {
        navigate('/edital');
    };
  return (
    <button className="edital-card" onClick={irParaDetalhesEdital}>
      <h2>{edital.title}</h2>
      <p>{edital.description}</p>
      <small>{edital.time}</small>
    </button>
  );
}
