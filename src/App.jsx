import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CourseDetails from "./pages/CourseDetails";
import EditalDetails from "./pages/EditalDetails";
import LastExams from "./pages/LastExams";
import Exam from "./pages/Exam";
import "./App.css";

function App() {
	return (
		<div className="app-container">
			<Router>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/curso" element={<CourseDetails />} />
					<Route path="/edital" element={<EditalDetails />} />
					<Route path="/provas" element={<LastExams />} />
					<Route path="/exame" element={<Exam />} />
				</Routes>
			</Router>
		</div>
	);
}

export default App;
