import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LabelBadge from "../components/LabelBadge";
import Sidebar from "../components/Sidebar";
import { useSearch } from "../contexts/SearchContext";
import { useAuth } from "../contexts/useAuth";
import {
	getFirstLinePreview,
	filterQuestions,
	highlightSearchTerm,
} from "../utils/questionUtils.jsx";

function MyQuestionsPage() {
	const navigate = useNavigate();
	const { token, isLoggedIn, user } = useAuth();
	const { searchTerm } = useSearch();
	const [questions, setQuestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedLabel, setSelectedLabel] = useState(null);

	useEffect(() => {
		if (searchTerm && searchTerm.trim() && selectedLabel) {
			setSelectedLabel(null);
		}
	}, [searchTerm, selectedLabel]);

	const handleLabelClick = (label) => {
		setSelectedLabel(selectedLabel?.id === label.id ? null : label);
	};

	const handleClearLabelFilter = () => {
		setSelectedLabel(null);
	};

	let filteredQuestions = filterQuestions(questions, searchTerm);

	if (selectedLabel) {
		filteredQuestions = filteredQuestions.filter((question) =>
			question.labels?.some((label) => label.id === selectedLabel.id),
		);
	}

	const handleQuestionClick = (questionId) => {
		navigate(`/questions/${questionId}`);
	};

	const handleEditClick = (e, question) => {
		e.stopPropagation();
		navigate(`/questions/${question.id}/edit`, {
			state: { questionData: question },
		});
	};

	useEffect(() => {
		const fetchMyQuestions = async () => {
			try {
				const response = await fetch("/api/questions/my-questions", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const data = await response.json();

				if (!response.ok) throw new Error(data.error);

				setQuestions(data);
			} catch (err) {
				setError(err.message || "Failed to load your questions.");
			} finally {
				setLoading(false);
			}
		};

		if (isLoggedIn && token) {
			fetchMyQuestions();
		} else {
			setError("You must be logged in to view your questions.");
			setLoading(false);
		}
	}, [isLoggedIn, token]);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					<Sidebar />

					<main className="flex-1">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
							<div className="flex justify-between items-center flex-wrap gap-4 mb-4">
								<div className="flex items-center gap-3 flex-wrap">
									<h1 className="text-2xl font-bold text-gray-900">
										{selectedLabel && !searchTerm
											? `My Questions tagged with "${selectedLabel.name}"`
											: searchTerm
												? `My Questions - Search Results for "${searchTerm}"`
												: "My Questions"}
										{(searchTerm || selectedLabel) && (
											<span className="text-sm font-normal text-gray-500 ml-2">
												({filteredQuestions.length} results)
											</span>
										)}
									</h1>
									{selectedLabel && (
										<button
											onClick={handleClearLabelFilter}
											className="text-sm text-[#281d80] hover:text-[#1f1566] underline cursor-pointer"
										>
											Clear filter
										</button>
									)}
								</div>
							</div>
							{loading && <p>Loading your questions...</p>}
							{error && <p className="text-red-500 text-sm">{error}</p>}
							{!loading && !error && questions.length === 0 && (
								<p className="text-gray-600">
									You have not posted any questions yet.
								</p>
							)}
							{!loading &&
								!error &&
								questions.length > 0 &&
								filteredQuestions.length === 0 && (
									<p className="text-gray-600">
										No questions found matching your search.
									</p>
								)}
							<div className="space-y-4 mt-6">
								{filteredQuestions.map((question) => (
									<div
										key={question.id}
										role="button"
										tabIndex={0}
										className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#281d80] focus:ring-opacity-50"
										onClick={() => handleQuestionClick(question.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												handleQuestionClick(question.id);
											}
										}}
									>
										<div className="flex justify-between items-start">
											<div className="flex items-center gap-3 flex-1">
												<h3 className="font-semibold text-lg text-gray-900 mb-2">
													{searchTerm
														? highlightSearchTerm(question.title, searchTerm)
														: question.title}
												</h3>
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
														{question.answer_count === 1 ? "Answer" : "Answers"}
													</span>
												)}
											</div>

											<button
												onClick={(e) => handleEditClick(e, question)}
												className="z-10 text-sm font-medium text-gray-500 hover:text-[#281d80] hover:bg-gray-100 px-3 py-1 rounded transition-colors"
												title="Edit your question"
											>
												✎ Edit
											</button>
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
										{question.labels &&
											Array.isArray(question.labels) &&
											question.labels.length > 0 && (
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
													user?.name ||
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
								))}
							</div>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default MyQuestionsPage;
