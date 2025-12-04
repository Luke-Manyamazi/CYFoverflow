import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { SearchProvider } from "./contexts/SearchContext";
import EditQuestion from "./pages/EditQuestion.jsx";
import Home from "./pages/Home";
import LabelsPage from "./pages/LabelsPage";
import Login from "./pages/Login";
import MyQuestionsPage from "./pages/MyQuestionsPage";
import MyResponsesPage from "./pages/MyResponsesPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import QuestionPage from "./pages/QuestionPage";
import QuestionsPage from "./pages/QuestionsPage";
import SignUp from "./pages/SignUp";
import "./App.css";

function App() {
	return (
		<AuthProvider>
			<SearchProvider>
				<Router>
					<div className="min-h-screen" style={{ backgroundColor: "#efeef8" }}>
						<Navbar />
						<Routes>
							{/* Existing Routes */}
							<Route path="/" element={<Home />} />
							<Route path="/login" element={<Login />} />
							<Route path="/signup" element={<SignUp />} />
							<Route path="/ask" element={<QuestionPage />} />

							<Route path="/questions/:id" element={<QuestionDetailPage />} />
							<Route path="/questions" element={<QuestionsPage />} />
							<Route path="/labels" element={<LabelsPage />} />
							<Route path="/my-questions" element={<MyQuestionsPage />} />
							<Route path="/my-responses" element={<MyResponsesPage />} />

							<Route path="/questions/:id/edit" element={<EditQuestion />} />
						</Routes>
					</div>
				</Router>
			</SearchProvider>
		</AuthProvider>
	);
}

export default App;
