import { useNavigate } from 'react-router-dom';

export default function ButtonVoltar() {
    const navigate = useNavigate();

    return (
      <button className="btn-voltar" onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Voltar
      </button>
    );
    }