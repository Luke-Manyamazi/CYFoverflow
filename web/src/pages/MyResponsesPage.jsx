import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { useLabelFilter } from "../contexts/LabelFilterContext";
import { useSearch } from "../contexts/SearchContext";
import { useAuth } from "../contexts/useAuth";
import {
	getFirstLinePreview,
	highlightSearchTerm,
	capitalizeTitle,
} from "../utils/questionUtils.jsx";

function MyResponsesPage() {
	const navigate = useNavigate();
	const { token, isLoggedIn } = useAuth();
	const { searchTerm } = useSearch();
	const { setSelectedLabel } = useLabelFilter();
	const [answers, setAnswers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		setSelectedLabel(null);
	}, [setSelectedLabel]);

	const filteredAnswers = filterAnswers(answers, searchTerm);

	const handleViewQuestion = (answer) => {
		const identifier = answer.question?.slug || answer.question_id;
		navigate(`/questions/${identifier}`, {
			state: { fromMyResponses: true },
		});
	};

	const handleViewAnswer = (answer) => {
		const identifier = answer.question?.slug || answer.question_id;
		navigate(`/questions/${identifier}#answer-${answer.id}`, {
			state: { fromMyResponses: true },
		});
	};

	useEffect(() => {
		const fetchMyAnswers = async () => {
			try {
				const response = await fetch("/api/answers/user/me", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch answers: ${response.status}`);
				}

				const data = await response.json();
				setAnswers(data);
			} catch (err) {
				console.error("Fetch error:", err);
				setError(err.message || "Failed to load your responses.");
			} finally {
				setLoading(false);
			}
		};

		if (isLoggedIn && token) {
			fetchMyAnswers();
		} else {
			setError("You must be logged in to view your responses.");
			setLoading(false);
		}
	}, [isLoggedIn, token]);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
				<div className="flex flex-col md:flex-row gap-4 md:gap-8">
					<Sidebar />

					<main className="flex-1 min-w-0">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-8">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-3 md:mb-4">
								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
									<h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
										{searchTerm
											? `My Responses - Search Results for "${searchTerm}"`
											: "My Responses"}
										{searchTerm && (
											<span className="text-xs sm:text-sm font-normal text-gray-500 ml-1 sm:ml-2">
												({filteredAnswers.length} results)
											</span>
										)}
									</h1>
								</div>
							</div>
							{loading && (
								<div className="flex justify-center items-center py-8 md:py-12">
									<div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-[#281d80]"></div>
									<span className="ml-3 text-gray-600">
										Loading your responses...
									</span>
								</div>
							)}
							{error && <p className="text-red-500 text-sm">{error}</p>}
							{!loading && !error && answers.length === 0 && (
								<div className="text-center py-8 md:py-12">
									<svg
										className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
										/>
									</svg>
									<h3 className="mt-2 text-sm md:text-base font-medium text-gray-900">
										No responses yet
									</h3>
									<p className="mt-1 text-xs md:text-sm text-gray-500">
										You have not responded to any questions yet.
									</p>
									<div className="mt-4 md:mt-6">
										<button
											onClick={() => navigate("/")}
											className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent shadow-sm text-xs md:text-sm font-medium rounded-md text-white bg-[#281d80] hover:bg-[#1f1566] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#281d80] cursor-pointer"
										>
											Back to Home Page
										</button>
									</div>
								</div>
							)}
							{!loading &&
								!error &&
								answers.length > 0 &&
								filteredAnswers.length === 0 && (
									<div className="text-center py-6 md:py-8">
										<p className="text-gray-600 text-sm md:text-base">
											No responses found matching your search.
										</p>
									</div>
								)}
							<div className="space-y-4 md:space-y-6 mt-4 md:mt-6">
								{filteredAnswers.map((answer) => (
									<div
										key={answer.id}
										className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow"
									>
										{/* Answer Content Section */}
										<div className="mb-3 md:mb-4">
											<div className="flex items-start gap-3 mb-2 md:mb-3">
												<div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-[#281d80] text-white rounded-full flex items-center justify-center">
													<span className="text-xs md:text-sm font-semibold">
														A
													</span>
												</div>
												<div className="flex-1">
													<p className="text-sm md:text-base text-gray-700 mb-1 md:mb-2">
														<span className="font-semibold">
															Your response:
														</span>{" "}
														{searchTerm
															? highlightSearchTerm(
																	getFirstLinePreview(answer.content),
																	searchTerm,
																)
															: getFirstLinePreview(answer.content)}
													</p>
													<p className="text-xs md:text-sm text-gray-500">
														Posted on{" "}
														{new Date(answer.created_at).toLocaleDateString(
															"en-US",
															{
																year: "numeric",
																month: "short",
																day: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															},
														)}
													</p>
												</div>
											</div>
										</div>

										{/* Question Info Section - Only show if we have question data */}
										{answer.question && (
											<div
												role="button"
												tabIndex={0}
												className="bg-gray-50 border border-gray-100 rounded-lg p-3 md:p-4 mb-3 md:mb-4 hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#281d80] focus:ring-opacity-50"
												onClick={() => handleViewQuestion(answer)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														handleViewQuestion(answer);
													}
												}}
											>
												<div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
													<h3 className="font-semibold text-base md:text-lg text-gray-900">
														{searchTerm
															? highlightSearchTerm(
																	capitalizeTitle(answer.question.title),
																	searchTerm,
																)
															: capitalizeTitle(answer.question.title)}
													</h3>
													<span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full whitespace-nowrap">
														<svg
															className="w-3 h-3"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fillRule="evenodd"
																d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
																clipRule="evenodd"
															/>
														</svg>
														Question
													</span>
												</div>
												<p className="text-sm md:text-base text-gray-600 line-clamp-2 mb-2">
													{searchTerm
														? highlightSearchTerm(
																getFirstLinePreview(
																	answer.question.body ||
																		answer.question.content,
																),
																searchTerm,
															)
														: getFirstLinePreview(
																answer.question.body || answer.question.content,
															)}
												</p>
												{answer.question.labels &&
													Array.isArray(answer.question.labels) &&
													answer.question.labels.length > 0 && (
														<div className="flex flex-wrap gap-2 mt-2">
															{answer.question.labels.map((label) => (
																<span
																	key={label.id}
																	className="px-2 py-0.5 md:px-2 md:py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
																>
																	{label.name}
																</span>
															))}
														</div>
													)}
												<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 mt-2 text-xs md:text-sm text-gray-500">
													<span>
														Asked by{" "}
														{answer.question.author_name ||
															answer.question.author?.name ||
															"Anonymous"}
													</span>
													<span>
														{new Date(
															answer.question.created_at,
														).toLocaleDateString("en-US", {
															year: "numeric",
															month: "short",
															day: "numeric",
														})}
													</span>
												</div>
											</div>
										)}

										{/* Show question ID if we don't have full question data */}
										{!answer.question && (
											<div className="bg-gray-50 border border-gray-100 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
												<div className="flex items-center justify-between">
													<div>
														<p className="text-sm md:text-base text-gray-700">
															<span className="font-semibold">
																Question ID:
															</span>{" "}
															{answer.question_id}
														</p>
														<p className="text-xs md:text-sm text-gray-500 mt-1">
															Click the buttons below to view the question or
															your answer
														</p>
													</div>
												</div>
											</div>
										)}

										{/* Actions */}
										<div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
											<button
												onClick={() => handleViewQuestion(answer)}
												className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-[#281d80] hover:text-white hover:bg-[#281d80] border border-[#281d80] rounded-lg transition-colors cursor-pointer"
											>
												View Question
											</button>
											<button
												onClick={() => handleViewAnswer(answer)}
												className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-[#281d80] hover:bg-[#1f1566] rounded-lg transition-colors cursor-pointer"
											>
												View Your Answer
											</button>
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

function filterAnswers(answers, searchTerm) {
	if (!searchTerm || !searchTerm.trim()) return answers;

	const term = searchTerm.toLowerCase();
	return answers.filter((answer) => {
		if (answer.content && answer.content.toLowerCase().includes(term)) {
			return true;
		}

		if (
			answer.question &&
			answer.question.title &&
			answer.question.title.toLowerCase().includes(term)
		) {
			return true;
		}

		if (
			answer.question &&
			(answer.question.body || answer.question.content) &&
			(answer.question.body?.toLowerCase().includes(term) ||
				answer.question.content?.toLowerCase().includes(term))
		) {
			return true;
		}

		return false;
	});
}

export default MyResponsesPage;
