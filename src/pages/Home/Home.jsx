import { useState, useEffect } from "react";
import {
  HeaderHome,
  CoursesList,
  EditaisList,
  LoadingSpinner,
  CourseSkeletonGrid,
} from "../../components";
import { fetchCourses } from "../../services/courses";
import { fetchEditais } from "../../services/edital";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Prepara IF - Início";
    Promise.all([fetchCourses(), fetchEditais()])
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <HeaderHome searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      {loading ? (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <LoadingSpinner text="Carregando cursos e editais..." />
          <CourseSkeletonGrid count={3} />
        </div>
      ) : (
        <>
          <CoursesList searchTerm={searchTerm} />
          <EditaisList />
        </>
      )}
    </div>
  );
}