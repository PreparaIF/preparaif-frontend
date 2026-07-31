import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, CourseDetails, EditalDetails, LastExams, ExamDetails, AdminPage } from "./pages";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/curso/:id" element={<CourseDetails />} />
          <Route path="/edital/:id" element={<EditalDetails />} />
          <Route path="/provas" element={<LastExams />} />
          <Route path="/exame/:id" element={<ExamDetails />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
