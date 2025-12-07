import { Editor } from "@tinymce/tinymce-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { FaEdit, FaTrash, FaCheckCircle } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

import Answer from "../components/Answer";
import AnswerForm from "../components/AnswerForm";
import LabelBadge from "../components/LabelBadge";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/useAuth";
import { capitalizeTitle } from "../utils/questionUtils.jsx";

function QuestionDetailPage() {
	const { id: identifier } = useParams();
	const navigate = useNavigate();
	const { isLoggedIn, token, user } = useAuth();
	const [question, setQuestion] = useState(null);
	const [answers, setAnswers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showAnswerForm, setShowAnswerForm] = useState(false);
	const editorRef = useRef(null);
	const answerFormRef = useRef(null);

	const fetchQuestion = useCallback(async () => {
		try {
			setLoading(true);
			setError("");
			const response = await fetch(`/api/questions/${identifier}`);

			if (!response.ok) {
				throw new Error("Failed to fetch question");
			}

			const data = await response.json();
			setQuestion(data);
		} catch (err) {
			console.error("Error fetching question:", err);
			setError("Failed to load question. Please try again later.");
		} finally {
			setLoading(false);
		}
	}, [identifier]);

	const fetchAnswers = useCallback(async () => {
		try {
			// Use question ID for answers API (answers API still uses ID)
			const questionId = question?.id || identifier;
			const response = await fetch(`/api/answers/${questionId}`);

			if (!response.ok) {
				throw new Error("Failed to fetch answers");
			}

			const data = await response.json();
			setAnswers(data || []);
		} catch (err) {
			console.error("Error fetching answers:", err);
			setAnswers([]);
		}
	}, [question?.id, identifier]);

	useEffect(() => {
		fetchQuestion();
	}, [fetchQuestion]);

	useEffect(() => {
		if (question?.id) {
			fetchAnswers();
		}
	}, [question?.id, fetchAnswers]);

	const handleAnswerClick = () => {
		if (!isLoggedIn) {
			const returnTo = question?.slug
				? `/questions/${question.slug}`
				: `/questions/${identifier}`;
			navigate("/login", {
				state: {
					message: "Please log in to answer questions",
					returnTo,
				},
			});
			return;
		}
		setShowAnswerForm(true);
		setTimeout(() => {
			answerFormRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}, 100);
	};

	const handleAnswerSuccess = () => {
		setShowAnswerForm(false);
		fetchQuestion();
		fetchAnswers();
	};

	const handleAnswerCancel = () => {
		setShowAnswerForm(false);
	};

	const handleMarkSolved = async (isSolved) => {
		if (!isLoggedIn || !token) return;

		try {
			const questionId = question?.id || identifier;
			const response = await fetch(`/api/questions/${questionId}/solve`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ isSolved }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to update solved status");
			}

			const updatedQuestion = await response.json();
			setQuestion(updatedQuestion);
		} catch (err) {
			console.error("Error marking question as solved:", err);
			alert(err.message || "Failed to update solved status");
		}
	};

	const isQuestionAuthor =
		isLoggedIn && user && question && user.id === question.user_id;

	const handleDelete = async () => {
		if (
			!window.confirm(
				"Are you sure you want to delete this question? This action cannot be undone.",
			)
		) {
			return;
		}

		if (!isLoggedIn || !token) {
			setError("You must be logged in to delete questions.");
			return;
		}

		try {
			const questionId = question?.id || identifier;
			const response = await fetch(`/api/questions/${questionId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to delete question");
			}

			navigate("/");
		} catch (err) {
			console.error("Error deleting question:", err);
			setError(err.message || "Failed to delete question. Please try again.");
		}
	};

	const handleEdit = () => {
		const editIdentifier = question?.slug || question?.id || identifier;
		navigate(`/questions/${editIdentifier}/edit`, {
			state: { questionData: question },
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex gap-8">
						<Sidebar />
						<main className="flex-1">
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
								<div className="text-center py-8">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#281d80] mx-auto"></div>
									<p className="mt-4 text-gray-600">Loading question...</p>
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}

	if (error || !question) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex gap-8">
						<Sidebar />
						<main className="flex-1">
							<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
								<div className="text-center py-8">
									<p className="text-red-600 mb-4">
										{error || "Question not found"}
									</p>
									<button
										onClick={() => navigate("/")}
										className="bg-[#281d80] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 cursor-pointer"
									>
										Go Back Home
									</button>
								</div>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex gap-8">
					<Sidebar />

					<main className="flex-1">
						<div className="mb-4">
							<button
								onClick={() => navigate("/")}
								className="flex items-center gap-2 text-gray-600 hover:text-[#281d80] transition-colors duration-200 cursor-pointer"
							>
								<FaArrowLeft className="w-4 h-4" />
								<span className="font-medium">Back to Home</span>
							</button>
						</div>
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
							<div className="flex justify-between items-start mb-4">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2 flex-wrap">
										<h1 className="text-3xl font-bold text-gray-900">
											{capitalizeTitle(question.title)}
										</h1>
										{question.is_solved && (
											<span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
												<svg
													className="w-4 h-4"
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
											<span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
												<svg
													className="w-4 h-4"
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
								</div>
								<div className="flex items-center gap-2">
									{isQuestionAuthor && (
										<>
											<button
												onClick={handleEdit}
												className="flex items-center justify-center w-10 h-10 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200"
												title="Edit question"
											>
												<FaEdit className="w-5 h-5" />
											</button>
											<button
												onClick={handleDelete}
												className="flex items-center justify-center w-10 h-10 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer bg-red-600 text-white hover:bg-red-700"
												title="Delete question"
											>
												<FaTrash className="w-5 h-5" />
											</button>
											<button
												onClick={() => handleMarkSolved(!question.is_solved)}
												className={`flex items-center justify-center w-10 h-10 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer ${
													question.is_solved
														? "bg-gray-200 text-gray-700 hover:bg-gray-300"
														: "bg-blue-600 text-white hover:bg-blue-700"
												}`}
												title={
													question.is_solved
														? "Mark as unsolved"
														: "Mark as solved"
												}
											>
												<FaCheckCircle className="w-5 h-5" />
											</button>
										</>
									)}
									{!isQuestionAuthor && (
										<button
											onClick={handleAnswerClick}
											className="bg-[#281d80] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
										>
											Answer
										</button>
									)}
								</div>
							</div>

							<div className="flex items-center gap-4 text-sm text-gray-600 mb-6 flex-wrap">
								<span>
									Asked by{" "}
									<span className="font-semibold">
										{question.author_name || "Anonymous"}
									</span>
								</span>
								<span>•</span>
								<span>
									{new Date(question.created_at).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
									{question.updated_at !== question.created_at && (
										<span className="ml-2 italic text-gray-500">(edited)</span>
									)}
								</span>
								{question.labels && question.labels.length > 0 && (
									<>
										<span>•</span>
										<div className="flex gap-2 flex-wrap">
											{question.labels.map((label) => (
												<LabelBadge
													key={label.id}
													label={label}
													onClick={(l) => {
														navigate("/", { state: { labelId: l.id } });
													}}
												/>
											))}
										</div>
									</>
								)}
							</div>

							<div className="question-content-display">
								<Editor
									tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
									onInit={(evt, editor) => (editorRef.current = editor)}
									initialValue={question.content || question.body}
									disabled={true}
									init={{
										readonly: true,
										menubar: false,
										toolbar: false,
										statusbar: false,
										plugins: "codesample",
										content_style: `
											body {
												font-family: ui-sans-serif, system-ui, sans-serif;
												font-size: 14px;
												margin: 0;
												padding: 0;
												overflow: visible;
											}
											hr { border: none; border-top: 1px dashed #ccc; margin: 10px 0; }
											pre {
												background: #f4f4f5;
												padding: 10px;
												border-radius: 5px;
												max-height: 400px;
												overflow-y: auto;
												overflow-x: auto;
												margin: 1em 0;
											}
											pre code {
												display: block;
												white-space: pre;
											}
											h3 { font-size: 1.2em; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; }
										`,
									}}
								/>
							</div>

							{question.browser && (
								<div className="mt-4 pt-4 border-t border-gray-200">
									<p className="text-sm text-gray-600">
										<strong>Browser:</strong> {question.browser}
									</p>
								</div>
							)}

							{question.os && (
								<div className="mt-2">
									<p className="text-sm text-gray-600">
										<strong>OS:</strong> {question.os}
									</p>
								</div>
							)}

							{question.documentation_link && (
								<div className="mt-2">
									<p className="text-sm text-gray-600">
										<strong>Documentation:</strong>{" "}
										<a
											href={question.documentation_link}
											target="_blank"
											rel="noopener noreferrer"
											className="text-[#281d80] hover:underline cursor-pointer"
										>
											{question.documentation_link}
										</a>
									</p>
								</div>
							)}
						</div>

						{showAnswerForm && (
							<div ref={answerFormRef}>
								<AnswerForm
									questionId={question?.id || identifier}
									token={token}
									onSuccess={handleAnswerSuccess}
									onCancel={handleAnswerCancel}
								/>
							</div>
						)}

						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h2 className="text-2xl font-bold text-gray-900 mb-4">
								Answers ({answers.length})
							</h2>
							{answers.length === 0 ? (
								<p className="text-gray-600">
									No answers yet. Be the first to answer!
								</p>
							) : (
								<div className="space-y-4">
									{answers.map((answer) => (
										<Answer
											key={answer.id}
											answer={answer}
											onDelete={fetchAnswers}
											onUpdate={fetchAnswers}
										/>
									))}
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default QuestionDetailPage;
