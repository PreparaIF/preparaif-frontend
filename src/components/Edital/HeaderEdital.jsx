import "./EditalStyle.css";
import ButtonVoltar from "../Utils/ButtonVoltar";

function HeaderEdital({ title }) {
  return (
    <div className="header-edital">
      <header className="details-header">
        <div className="header-text-content">
          <ButtonVoltar />
          <span className="source-info">
            Informações extraídas do Portal do Ifal
          </span>
          <h1 className="edital-main-title">{title}</h1>

          <p className="read-time-info">
            <span className="green-highlight">Informações sobre o edital</span>{" "}
            - 4min de leitura
          </p>
        </div>
      </header>
    </div>
  );
}

export default HeaderEdital;
