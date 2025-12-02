import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import QuestionPage from "./pages/QuestionPage";
import SignUp from "./pages/SignUp";
import QuestionsPage from "./pages/QuestionsPage";
import LabelsPage from "./pages/LabelsPage";
import MyQuestionsPage from "./pages/MyQuestionsPage";
import MyResponsesPage from "./pages/MyResponsesPage";
import "./App.css";

function App() {
	return (
		<AuthProvider>
			<Router>
				<div className="min-h-screen" style={{ backgroundColor: "#efeef8" }}>
					<Navbar />
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<SignUp />} />
						<Route path="/ask" element={<QuestionPage />} />
						<Route path="/questions" element={<QuestionsPage />} />
						<Route path="/labels" element={<LabelsPage />} />
						<Route path="/my-questions" element={<MyQuestionsPage />} />
						<Route path="/my-responses" element={<MyResponsesPage />} />
					</Routes>
				</div>
			</Router>
		</AuthProvider>
	);
}

export default App;
