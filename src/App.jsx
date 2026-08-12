import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, CourseDetails, EditalDetails, LastExams, ExamDetails, AdminPage, ProfilePage, CoursesPage, EditaisPage } from "./pages";
import LoginPage from "./pages/Login/LoginPage";
import RegisterPage from "./pages/Register/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cursos" element={<CoursesPage />} />
            <Route path="/editais" element={<EditaisPage />} />
            <Route path="/curso/:id" element={<CourseDetails />} />
            <Route path="/edital/:id" element={<EditalDetails />} />
            <Route path="/provas" element={<LastExams />} />
            <Route path="/exame/:id" element={<ExamDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
