import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
		<div className="min-h-screen bg-gray-50">
			{/* Your existing Nav component will render automatically */}

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					{/* Sidebar */}
					<aside className="w-64 flex-shrink-0">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
							<nav>
								<ul className="space-y-2">
									{/* Public Items */}
									<li>
										<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 text-gray-700">
											<span>📋</span>
											<span className="font-medium">Questions</span>
										</button>
									</li>
									<li>
										<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 text-gray-700">
											<span>🏷️</span>
											<span className="font-medium">Tags</span>
										</button>
									</li>

									{/* Private Items (only show when logged in) */}
									{isLoggedIn && (
										<>
											<li className="border-t border-gray-200 mt-4 pt-4">
												<h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Personal
												</h3>
											</li>
											<li>
												<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 text-gray-700">
													<span>❓</span>
													<span className="font-medium">My Questions</span>
												</button>
											</li>
											<li>
												<button className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 text-gray-700">
													<span>💬</span>
													<span className="font-medium">My Responses</span>
												</button>
											</li>
										</>
									)}
								</ul>
							</nav>
						</div>
					</aside>

					{/* Main Content Area */}
					<main className="flex-1">
						{/* Welcome Section */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6 text-center">
							<h1 className="text-4xl font-bold text-gray-900 mb-4">
								Welcome to <span style={{ color: "#ed4d4e" }}>CYF</span>
								<span style={{ color: "#281d80" }}>overflow</span>
							</h1>
							<p className="text-xl text-gray-600 mb-6 font-medium">
								Your community Q&A platform for technical questions
							</p>

							{isLoggedIn && user && (
								<div className="mt-4">
									<p className="text-lg text-gray-700 mb-4">
										Welcome back,{" "}
										<span className="font-semibold text-[#281d80]">
											{user.name}
										</span>
										! 👋
									</p>
								</div>
							)}
						</div>

						{/* Search Bar Section */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
							<div className="max-w-3xl mx-auto">
								<form onSubmit={handleSearch} className="flex gap-4">
									<div className="flex-1 relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<svg
												className="h-5 w-5 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
												/>
											</svg>
										</div>
										<input
											type="text"
											placeholder="Search questions, topics, or users..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#281d80] focus:border-[#281d80] transition-all duration-200"
										/>
									</div>
									<button
										type="submit"
										className="bg-[#281d80] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
									>
										<svg
											className="h-5 w-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
										Search
									</button>
								</form>

								{/* Search Tips */}
								<div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-gray-500">
									<span className="bg-gray-100 px-3 py-1 rounded-full">
										Try: JavaScript
									</span>
									<span className="bg-gray-100 px-3 py-1 rounded-full">
										React
									</span>
									<span className="bg-gray-100 px-3 py-1 rounded-full">
										Node.js
									</span>
									<span className="bg-gray-100 px-3 py-1 rounded-full">
										CSS
									</span>
								</div>
							</div>
						</div>

						{/* Latest Questions Section */}
						<div className="bg-white rounded-lg shadow-sm border border-gray-200">
							<div className="p-6 border-b border-gray-200">
								<div className="flex justify-between items-center">
									<h2 className="text-2xl font-bold text-gray-900">
										{searchTerm
											? `Search Results for "${searchTerm}"`
											: "Latest Questions"}
										{searchTerm && (
											<span className="text-sm font-normal text-gray-500 ml-2">
												({filteredQuestions.length} results)
											</span>
										)}
									</h2>
									{isLoggedIn && (
										<button
											onClick={() => navigate("/ask")}
											className="bg-[#281d80] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg"
										>
											Ask Question
										</button>
									)}
								</div>
							</div>

							<div className="p-6">
								{loading ? (
									<div className="text-center py-8">
										<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#281d80] mx-auto"></div>
										<p className="text-gray-600 mt-4">Loading questions...</p>
									</div>
								) : error ? (
									<div className="text-center py-8 text-red-600">
										{error}
										<button
											onClick={fetchLatestQuestions}
											className="block mx-auto mt-4 bg-[#281d80] text-white px-4 py-2 rounded hover:bg-[#1f1566]"
										>
											Try Again
										</button>
									</div>
								) : filteredQuestions.length > 0 ? (
									<div className="space-y-4">
										{filteredQuestions.map((question) => (
											<div
												key={question.id}
												role="button"
												tabIndex={0}
												className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#281d80] focus:ring-opacity-50"
												onClick={() => {
													if (isLoggedIn) {
														navigate(`/questions/${question.id}`);
													} else {
														navigate("/login", {
															state: {
																message: "Please log in to view questions",
																returnTo: `/questions/${question.id}`,
															},
														});
													}
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														if (isLoggedIn) {
															navigate(`/questions/${question.id}`);
														} else {
															navigate("/login", {
																state: {
																	message: "Please log in to view questions",
																	returnTo: `/questions/${question.id}`,
																},
															});
														}
													}
												}}
											>
												<h3 className="font-semibold text-lg text-gray-900 mb-2">
													{question.title}
												</h3>
												{/* Cleaned content display */}
												<p className="text-gray-600 line-clamp-2">
													{getFirstLinePreview(
														question.body || question.content,
													)}
												</p>
												<div className="flex justify-between items-center mt-3 text-sm text-gray-500">
													<span>
														Asked by{" "}
														{question.author_name ||
															question.author?.name ||
															"Anonymous"}
													</span>
													<span>
														{new Date(question.created_at).toLocaleDateString()}
													</span>
												</div>
											</div>
										))}
									</div>
								) : searchTerm ? (
									<div className="text-center py-8 text-gray-500">
										<svg
											className="h-16 w-16 text-gray-300 mx-auto mb-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1}
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
										<p className="text-lg font-medium text-gray-900 mb-2">
											No questions found
										</p>
										<p className="text-gray-600 mb-4">
											Try different search terms or ask a new question
										</p>
										{isLoggedIn && (
											<button
												onClick={() => navigate("/ask")}
												className="bg-[#281d80] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200"
											>
												Ask a Question
											</button>
										)}
									</div>
								) : (
									<div className="text-center py-8 text-gray-500">
										<svg
											className="h-16 w-16 text-gray-300 mx-auto mb-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1}
												d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<p className="text-lg font-medium text-gray-900 mb-2">
											No questions yet
										</p>
										<p className="text-gray-600 mb-4">
											Be the first to ask a question and help build our
											community!
										</p>
										{isLoggedIn && (
											<button
												onClick={() => navigate("/ask")}
												className="bg-[#281d80] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200"
											>
												Ask First Question
											</button>
										)}
									</div>
								)}
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default Home;
