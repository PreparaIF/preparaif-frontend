import './EditalDetails.css';
import { useNavigate } from 'react-router-dom';

function EditalDetails() {
  const navigate = useNavigate();
  return (
    <div className="edict-page-container">
     
      <button className="btn-voltar edict-back" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Voltar
      </button>

      <div className="edict-content-split">

        <div className="edict-left-col">
          <span className="source-info">Informações extraídas do Portal do Ifal</span>
          <h1 className="edict-title">Edital 01/2025</h1>
          <p className="read-time-info">
            <span className="green-highlight">Informações sobre o curso</span> - 4min de leitura
          </p>
          <img 
            src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop" 
            alt="Sala de aula" 
            className="edict-image" 
          />
        </div>

        <div className="edict-right-col">
          <div className="edict-text-content">
            <p>O Instituto Federal de Alagoas (IFAL) torna público o Edital de Ingresso 2025, que estabelece as normas e procedimentos para a seleção de candidatos aos cursos de graduação presenciais e a distância ofertados pela instituição.</p>
            <p>O processo seletivo é realizado com base nas notas obtidas no Exame Nacional do Ensino Médio (ENEM)...</p>

            <h4>Resumo do Edital</h4>
            <ul>
              <li>Período de inscrição: de 10 a 30 de novembro de 2025</li>
              <li>Forma de ingresso: aproveitamento das notas do ENEM 2023 ou 2024</li>
              <li>Publicação do resultado preliminar: 15 de dezembro de 2025</li>
            </ul>

            <h4>Informações úteis</h4>
            <ul>
              <li>Inscrição gratuita e realizada exclusivamente pelo site oficial do IFAL.</li>
              <li>O candidato deve ler atentamente o edital completo antes de efetuar a inscrição.</li>
            </ul>
          </div>

          <div className="action-card">
            <div className="action-card-header">
              <div className="icone-instituto"></div> 
              <span className="nome-instituto">IFAL - Campus Maceió</span>
            </div>
            
            <h3 className="action-card-title">Fazer Provas anteriores</h3>
            
            <div className="action-card-footer">
              <span className="course-info">Informações públicas no site da instituição</span>
              <button className="course-button" onClick={()=> navigate('/provas')}>Fazer provas</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EditalDetails;