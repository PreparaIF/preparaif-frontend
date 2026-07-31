import { useState, useEffect } from "react";
import {HeaderHome, CoursesList, EditaisList} from "../../components";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Prepara IF - Início";
  }, []);

  return (
    <div>
      <HeaderHome searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <CoursesList searchTerm={searchTerm} />
      <EditaisList />
    </div>
  );
}