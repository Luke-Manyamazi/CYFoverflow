import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";
import { useAuth } from "../contexts/useAuth";

function Home() {
	const navigate = useNavigate();
	const { isLoggedIn, user } = useAuth();
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchLatestQuestions();
	}, []);

	const fetchLatestQuestions = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/questions?limit=10");

			if (!response.ok) {
				throw new Error(`Failed to fetch questions: ${response.status}`);
			}

			const data = await response.json();
			setQuestions(data);
		} catch (err) {
			console.error("Error fetching questions:", err);
			setError("Failed to load questions. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	// Function to extract the first meaningful line from any template
	const getFirstLinePreview = (html) => {
		if (!html) return "No description provided";

		// Create a temporary div to parse HTML
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		// Remove template-specific elements that don't contain user content
		tempDiv.querySelectorAll("h3").forEach((el) => el.remove());
		tempDiv.querySelectorAll("hr").forEach((el) => el.remove());

		// Get all paragraph elements
		const paragraphs = tempDiv.querySelectorAll("p");

		// Find the first paragraph that has actual user content (not empty or placeholder)
		for (let p of paragraphs) {
			const text = p.textContent.trim();

			// Skip empty paragraphs or template placeholders
			if (
				text &&
				!text.includes("Problem Summary") &&
				!text.includes("What I've Already Tried") &&
				!text.includes("Describe your problem here") &&
				!text.includes("Explain what you tried here") &&
				text.length > 5
			) {
				// Minimum content length
				// Return first meaningful content, truncated if needed
				return text.length > 100 ? text.substring(0, 100) + "..." : text;
			}
		}

		// If no meaningful paragraphs found, try to get any text content
		let fallbackText = tempDiv.textContent || tempDiv.innerText || "";
		fallbackText = fallbackText
			.replace(/Problem Summary/g, "")
			.replace(/What I've Already Tried/g, "")
			.replace(/\/\/ Your code here/g, "")
			.replace(/\s+/g, " ")
			.trim();

		// Get first sentence or first 80 chars
		const firstSentence = fallbackText.split(".")[0];
		if (firstSentence && firstSentence.length > 10) {
			return firstSentence.length > 100
				? firstSentence.substring(0, 100) + "..."
				: firstSentence;
		}

		// Final fallback
		return fallbackText.length > 100
			? fallbackText.substring(0, 100) + "..."
			: fallbackText || "No description provided";
	};

	// Filter questions based on search term
	const filteredQuestions = questions.filter(
		(question) =>
			question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(question.body &&
				question.body.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(question.author_name &&
				question.author_name.toLowerCase().includes(searchTerm.toLowerCase())),
	);

	const handleSearch = (e) => {
		e.preventDefault();
		// For now, I am filtering client-side

		console.log("Searching for:", searchTerm);
	};

	return (
		<>
			<Sidebar />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:ml-64">
				<div className="flex gap-6 lg:gap-8">
					{/* Main Content */}
					<main className="flex-1 min-w-0">
						<div className="flex items-center justify-between gap-6">
							<div>
								<h1 className="text-5xl font-bold text-gray-900 mb-6">
									Welcome to <span style={{ color: "#ed4d4e" }}>CYF</span>
									<span style={{ color: "#281d80" }}>overflow</span>
								</h1>
								<p className="text-xl text-gray-600 mb-4 font-medium">
									Your community Q&A platform for technical questions
								</p>
							</div>

							{isLoggedIn && user && (
								<button
									onClick={() => navigate("/ask")}
									className="bg-[#281d80] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg shrink-0"
								>
									Ask a Question
								</button>
							)}
						</div>
					</main>
				</div>
			</div>
		</>
	);
}

export default Home;
