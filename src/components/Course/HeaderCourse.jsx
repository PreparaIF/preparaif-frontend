import "./CourseStyle.css";
import ButtonVoltar from "../Utils/ButtonVoltar";

function HeaderCourse({ title, image }) {
  return (
    <div className="header-course">
      <header className="details-header">
        <div className="header-text-content">
          <ButtonVoltar />
          <div className="header-text-content-inner">
            <span className="source-info">
              Informações extraídas do Portal do Ifal
            </span>
            <h1 className="course-main-title">{title}</h1>

            <p className="read-time-info">
              <span className="green-highlight">Informações sobre o curso</span>{" "}
              - 4min de leitura
            </p>
          </div>
          <section></section>
        </div>

        <div className="header-image-content">
          <img
            src={image}
            alt="Sala de aula"
            className="course-featured-image"
          />
        </div>
      </header>
    </div>
  );
}

export default HeaderCourse;
