import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";

import { useAuth } from "../contexts/useAuth";
import Sidebar from "../components/sidebar";
import AnswerForm from "../components/AnswerForm";

function QuestionDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { isLoggedIn, token } = useAuth();
	const [question, setQuestion] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [showAnswerForm, setShowAnswerForm] = useState(false);
	const editorRef = useRef(null);

	const fetchQuestion = useCallback(async () => {
		try {
			setLoading(true);
			setError("");
			const response = await fetch(`/api/questions/${id}`);

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
	}, [id]);

	useEffect(() => {
		fetchQuestion();
	}, [fetchQuestion]);


	const handleAnswerClick = () => {
		if (!isLoggedIn) {
			navigate("/login", {
				state: {
					message: "Please log in to answer questions",
					returnTo: `/questions/${id}`,
				},
			});
			return;
		}
		setShowAnswerForm(true);
	};

	const handleAnswerSuccess = () => {
		setShowAnswerForm(false);
		fetchQuestion();
	};

	const handleAnswerCancel = () => {
		setShowAnswerForm(false);
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
									<p className="text-red-600 mb-4">{error || "Question not found"}</p>
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
						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
							<div className="flex justify-between items-start mb-4">
								<h1 className="text-3xl font-bold text-gray-900">{question.title}</h1>
								<button
									onClick={handleAnswerClick}
									className="bg-[#281d80] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
								>
									Answer
								</button>
							</div>

							<div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
								<span>
									Asked by <span className="font-semibold">{question.author_name || "Anonymous"}</span>
								</span>
								<span>•</span>
								<span>{new Date(question.created_at).toLocaleDateString()}</span>
								{question.labels && question.labels.length > 0 && (
									<>
										<span>•</span>
										<div className="flex gap-2">
											{question.labels.map((label) => (
												<span
													key={label.id}
													className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
												>
													{label.name}
												</span>
											))}
										</div>
									</>
								)}
							</div>

							<div className="question-content-display">
								<Editor
									tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
									onInit={(evt, editor) => (editorRef.current = editor)}
									initialValue={question.content}
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
							<AnswerForm
								questionId={id}
								token={token}
								onSuccess={handleAnswerSuccess}
								onCancel={handleAnswerCancel}
							/>
						)}

						<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
							<h2 className="text-2xl font-bold text-gray-900 mb-4">Answers</h2>
							<p className="text-gray-600">No answers yet. Be the first to answer!</p>
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default QuestionDetailPage;

