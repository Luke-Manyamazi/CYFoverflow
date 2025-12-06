import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import LabelBadge from "../components/LabelBadge";
import Sidebar from "../components/Sidebar";
import { useLabelFilter } from "../contexts/LabelFilterContext";
import { useSearch } from "../contexts/SearchContext";
import { useAuth } from "../contexts/useAuth";
import {
	getFirstLinePreview,
	filterQuestions,
	highlightSearchTerm,
} from "../utils/questionUtils.jsx";

const AskQuestionButton = ({
	className = "",
	children = "Ask Question",
	onNavigate,
}) => (
	<button
		onClick={() => onNavigate("/ask")}
		className={`bg-[#281d80] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer ${className}`}
	>
		{children}
	</button>
);

function Home() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isLoggedIn, user } = useAuth();
	const { searchTerm } = useSearch();
	const { selectedLabel, setSelectedLabel } = useLabelFilter();
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (searchTerm && searchTerm.trim() && selectedLabel) {
			setSelectedLabel(null);
		}
	}, [searchTerm, selectedLabel, setSelectedLabel]);

	useEffect(() => {
		if (selectedLabel) {
			fetchQuestionsByLabel(selectedLabel.id);
		} else {
			fetchLatestQuestions();
		}
	}, [selectedLabel]);

	useEffect(() => {
		if (location.state?.labelId) {
			fetch("/api/questions/labels/all")
				.then((res) => res.json())
				.then((labels) => {
					const label = labels.find((l) => l.id === location.state.labelId);
					if (label) {
						setSelectedLabel(label);
					}
				})
				.catch(console.error);
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [location.state?.labelId, location.pathname, navigate, setSelectedLabel]);

	const fetchLatestQuestions = async () => {
		try {
			setLoading(true);
			setError("");
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

	const fetchQuestionsByLabel = async (labelId) => {
		try {
			setLoading(true);
			setError("");
			const response = await fetch("/api/questions/search/by-labels", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					labelId: [labelId],
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to fetch questions");
			}

			const data = await response.json();
			setQuestions(data);
		} catch (err) {
			console.error("Error fetching questions by label:", err);
			setError("Failed to load questions. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	const handleLabelClick = (label) => {
		setSelectedLabel(label);
	};

	const handleClearLabelFilter = () => {
		setSelectedLabel(null);
	};

	const filteredQuestions = filterQuestions(questions, searchTerm);

	const handleQuestionClick = (question) => {
		const identifier = question.slug || question.id;
		navigate(`/questions/${identifier}`);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					<Sidebar />

					<main className="flex-1">
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

						<div className="bg-white rounded-lg shadow-sm border border-gray-200">
							<div className="p-6 border-b border-gray-200">
								<div className="flex justify-between items-center flex-wrap gap-4">
									<div className="flex items-center gap-3 flex-wrap">
										<h2 className="text-2xl font-bold text-gray-900">
											{selectedLabel && !searchTerm
												? `Questions tagged with "${selectedLabel.name}"`
												: searchTerm
													? `Search Results for "${searchTerm}"`
													: "Latest Questions"}
											{(searchTerm || selectedLabel) && (
												<span className="text-sm font-normal text-gray-500 ml-2">
													({filteredQuestions.length} results)
												</span>
											)}
										</h2>
										{selectedLabel && (
											<button
												onClick={handleClearLabelFilter}
												className="text-sm text-[#281d80] hover:text-[#1f1566] underline cursor-pointer"
											>
												Clear filter
											</button>
										)}
									</div>
									{isLoggedIn && <AskQuestionButton onNavigate={navigate} />}
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
											className="block mx-auto mt-4 bg-[#281d80] text-white px-4 py-2 rounded hover:bg-[#1f1566] cursor-pointer"
										>
											Try Again
										</button>
									</div>
								) : filteredQuestions.length > 0 ? (
									<div className="space-y-4">
										{filteredQuestions.map((question) => {
											return (
												<div
													key={question.id}
													role="button"
													tabIndex={0}
													className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#281d80] focus:ring-opacity-50"
													onClick={() => handleQuestionClick(question)}
													onKeyDown={(e) => {
														if (e.key === "Enter" || e.key === " ") {
															e.preventDefault();
															handleQuestionClick(question);
														}
													}}
												>
													<div className="flex justify-between items-start">
														<div className="flex items-center gap-3 flex-1">
															<h3 className="font-semibold text-lg text-gray-900 mb-2">
																{searchTerm
																	? highlightSearchTerm(
																			question.title,
																			searchTerm,
																		)
																	: question.title}
															</h3>
															{question.is_solved && (
																<span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full whitespace-nowrap mb-2">
																	<svg
																		className="w-3 h-3"
																		fill="currentColor"
																		viewBox="0 0 20 20"
																	>
																		<path
																			fillRule="evenodd"
																			d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																			clipRule="evenodd"
																		/>
																	</svg>
																	Solved
																</span>
															)}
															{question.answer_count > 0 && (
																<span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full whitespace-nowrap mb-2">
																	<svg
																		className="w-3 h-3"
																		fill="currentColor"
																		viewBox="0 0 20 20"
																	>
																		<path
																			fillRule="evenodd"
																			d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																			clipRule="evenodd"
																		/>
																	</svg>
																	{question.answer_count}{" "}
																	{question.answer_count === 1
																		? "Answer"
																		: "Answers"}
																</span>
															)}
														</div>
													</div>

													<p className="text-gray-600 line-clamp-2">
														{searchTerm
															? highlightSearchTerm(
																	getFirstLinePreview(
																		question.body || question.content,
																	),
																	searchTerm,
																)
															: getFirstLinePreview(
																	question.body || question.content,
																)}
													</p>
													{question.labels && question.labels.length > 0 && (
														<div className="flex flex-wrap gap-2 mt-3">
															{question.labels.map((label) => (
																<LabelBadge
																	key={label.id}
																	label={label}
																	onClick={handleLabelClick}
																/>
															))}
														</div>
													)}
													<div className="flex justify-between items-center mt-3 text-sm text-gray-500">
														<span>
															Asked by{" "}
															{question.author_name ||
																question.author?.name ||
																"Anonymous"}
														</span>
														<span>
															{new Date(question.created_at).toLocaleDateString(
																"en-US",
																{
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																	hour: "2-digit",
																	minute: "2-digit",
																},
															)}
														</span>
													</div>
												</div>
											);
										})}
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
											<AskQuestionButton
												className="shadow-md hover:shadow-lg"
												onNavigate={navigate}
											>
												Ask a Question
											</AskQuestionButton>
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
											<AskQuestionButton
												className="shadow-md hover:shadow-lg"
												onNavigate={navigate}
											>
												Ask First Question
											</AskQuestionButton>
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
