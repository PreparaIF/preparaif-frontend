import { useState } from "react";
import HeaderHome from "../components/HeaderHome";
import CoursesList from "../components/CoursesList";
import EditaisList from "../components/EditaisList";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div>
      <HeaderHome searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <CoursesList searchTerm={searchTerm} />
      <EditaisList />
    </div>
  );
}