import { useState, useEffect } from "react";
import { fetchEditais } from "../../services/edital";
import Edital from "./EditalCard";
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
        <h2 className="title">Editais Anteriores</h2>
      </div>

      <div className="editais-carousel">
        {loading && <p>Carregando editais...</p>}
        {!loading &&
          editais.map((edital) => (
            <div className="edital-item" key={edital.id}>
              <Edital edital={edital} />
            </div>
          ))}
      </div>
    </section>
  );
}