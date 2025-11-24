import { Editor } from "@tinymce/tinymce-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

import { TEMPLATES } from "./templates";

const AskQuestionPage = () => {
	const navigate = useNavigate();
	const { token, isLoggedIn } = useAuth();
	// Controls the View (null = Selection Grid, 'id' = Editor Form)
	const [activeTemplate, setActiveTemplate] = useState(null);

	// Stores the initial HTML for the Editor to load (Static)
	// I did separate this from 'content' to prevent cursor jumping.
	const [initialContent, setInitialContent] = useState("");

	// Stores the live HTML as the user types
	const [content, setContent] = useState("");
	const [title, setTitle] = useState("");

	const [charCount, setCharCount] = useState(0);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const editorRef = useRef(null);

	// Template specific metadata
	const [templateFields, setTemplateFields] = useState({
		"bug-report": { browser: "", os: "" },
		"how-to": { documentationLink: "" },
	});

	// --- HANDLERS ---

	const handleTemplateSelect = (template) => {
		// Set the static content for the Editor's initialization
		setInitialContent(template.content);

		// Set the live content state (so it's ready if they hit submit immediately)
		setContent(template.content);

		// Switch view to the form
		setActiveTemplate(template.id);

		// Reset validation
		setCharCount(0);
		setError(null);
	};

	const handleBackToSelection = () => {
		if (
			window.confirm(
				"Going back will clear your current progress. Are you sure?",
			)
		) {
			setActiveTemplate(null);
			setInitialContent("");
			setContent("");
			setTitle("");
			setError(null);
		}
	};

	const handleEditorChange = (newContent, editor) => {
		// Update live state
		setContent(newContent);

		// Calculate text length (ignoring the CSS placeholders)
		const textLength = editor.getContent({ format: "text" }).trim().length;
		setCharCount(textLength);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!isLoggedIn || !token) {
			setError("You must be logged in to post a question.");
			return;
		}

		const plainText = editorRef.current.getContent({ format: "text" });

		if (!title.trim()) {
			setError("Please enter a title for your question.");
			return;
		}

		if (plainText.trim().length < 50) {
			setError("Your question body is too short. Please provide more detail.");
			return;
		}

		setIsSubmitting(true);

		let metaData = {};
		if (activeTemplate && templateFields[activeTemplate]) {
			metaData = templateFields[activeTemplate];
		}

		// Remove placeholder attributes/classes so they aren't saved to DB
		const parser = new DOMParser();
		const doc = parser.parseFromString(content, "text/html");

		doc.querySelectorAll(".template-placeholder").forEach((el) => {
			el.classList.remove("template-placeholder"); // Remove class
			el.removeAttribute("data-placeholder"); // Remove attribute
		});

		const cleanContent = doc.body.innerHTML;

		const questionData = {
			title: title,
			content: cleanContent,
			templateType: activeTemplate || "general-question",
			browser: metaData.browser || null,
			os: metaData.os || null,
			documentationLink: metaData.documentationLink || null,
		};

		try {
			const response = await fetch("/api/questions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(questionData),
			});

			const data = await response.json();

			if (!response.ok)
				throw new Error(data.message || "Something went wrong.");

			console.log("Question Created:", data);
			navigate("/");
		} catch (err) {
			console.error("Submission Error:", err);
			setError(err.message || "Failed to connect to the server.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// TEMPLATE SELECTION
	if (!activeTemplate) {
		return (
			<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
				<div className="max-w-5xl w-full space-y-10 animate-fade-in">
					<div className="text-center">
						<h2 className="text-4xl font-extrabold text-gray-900 mb-4">
							What kind of question do you have?
						</h2>
						<p className="text-lg text-gray-600">
							Select a template to help us help you faster.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{TEMPLATES.map((template) => (
							<button
								key={template.id}
								onClick={() => handleTemplateSelect(template)}
								className={`
                  relative group flex flex-col items-start p-8 rounded-2xl border-2 transition-all duration-300 ease-in-out
                  hover:shadow-2xl hover:-translate-y-2 text-left w-full h-full
                  ${template.color || "bg-white border-gray-200 hover:border-gray-400"}
                `}
							>
								<div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">
									{template.icon}
								</div>
								<h3
									className={`text-xl font-bold mb-3 ${template.textColor || "text-gray-900"}`}
								>
									{template.title}
								</h3>
								<p className="text-gray-600 leading-relaxed">
									{template.description}
								</p>
								<div className="mt-auto pt-6 flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-900">
									Select Template &rarr;
								</div>
							</button>
						))}
					</div>

					<div className="text-center pt-8">
						<button
							onClick={() => navigate(-1)}
							className="text-gray-500 hover:text-gray-700 underline"
						>
							Cancel and go back
						</button>
					</div>
				</div>
			</div>
		);
	}

	// EDITOR FORM ---
	return (
		<div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
			<div className="max-w-4xl w-full">
				{/* Back Button */}
				<button
					onClick={handleBackToSelection}
					className="mb-6 flex items-center text-sm text-gray-500 hover:text-[#281d80] transition-colors group"
				>
					<span className="mr-2 group-hover:-translate-x-1 transition-transform">
						&larr;
					</span>
					Choose a different template
				</button>

				<div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-fade-in">
					<div className="text-center border-b border-gray-100 pb-6">
						<h2 className="text-3xl font-bold text-gray-900 mb-2">
							Ask a public question
						</h2>
						<div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 mt-2">
							Using Template:{" "}
							<span className="font-bold ml-1">
								{TEMPLATES.find((t) => t.id === activeTemplate)?.title}
							</span>
						</div>
					</div>

					<form className="space-y-6" onSubmit={handleSubmit}>
						{error && (
							<div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md text-sm">
								{error}
							</div>
						)}

						<div>
							<label
								htmlFor="questionTitle"
								className="block text-sm font-semibold text-gray-700 mb-2"
							>
								Question Title
							</label>
							<input
								id="questionTitle"
								type="text"
								disabled={isSubmitting}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#281d80] focus:ring-2 focus:ring-[#281d80]/20 transition-all"
								placeholder="e.g., How do I filter an array in JavaScript?"
							/>
						</div>

						<div>
							<label
								htmlFor="questionDetails"
								className="block text-sm font-semibold text-gray-700 mb-2"
							>
								Details
							</label>
							<div
								id="questionDetails"
								className="rounded-lg overflow-hidden border-2 border-gray-200 focus-within:border-[#281d80] focus-within:ring-2 focus-within:ring-[#281d80]/20 transition-all"
							>
								<Editor
									tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
									onInit={(evt, editor) => (editorRef.current = editor)}
									// CURSOR JUMP:
									// 1. key ensures a fresh instance is created when template changes
									// 2. initialValue sets data ONCE. We do NOT bind 'value' to 'content'.
									key={activeTemplate}
									initialValue={initialContent}
									disabled={isSubmitting}
									onEditorChange={handleEditorChange}
									init={{
										height: 400,
										menubar: false,
										statusbar: false,
										plugins: "codesample link lists",
										toolbar:
											"undo redo | blocks | bold italic | bullist numlist | link | codesample",
										extended_valid_elements:
											"p[class|data-placeholder],li[class|data-placeholder],div[data-template]",
										content_style: `
                                    body { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; }
                                    hr { border: none; border-top: 1px dashed #ccc; margin: 10px 0; }
                                    pre { background: #f4f4f5; padding: 10px; border-radius: 5px; }
                                    .template-placeholder { position: relative; }
                                    .template-placeholder:not(.has-text)::before {
                                        content: attr(data-placeholder);
                                        position: absolute; left: 0; top: 0;
                                        color: #9ca3af; font-style: italic; pointer-events: none;
                                    }
                                `,
										setup: (editor) => {
											// hide the placeholder CSS
											const togglePlaceholder = () => {
												const placeholders = editor.dom.select(
													".template-placeholder",
												);
												placeholders.forEach((node) => {
													const hasText = node.textContent.trim().length > 0;
													if (hasText) editor.dom.addClass(node, "has-text");
													else editor.dom.removeClass(node, "has-text");
												});
											};
											editor.on("init keyup change input", togglePlaceholder);
										},
									}}
								/>
							</div>
						</div>

						<div className="flex justify-end mt-2">
							<span
								className={`text-xs ${charCount < 50 ? "text-red-500" : "text-gray-500"}`}
							>
								{charCount} characters (min 50)
							</span>
						</div>

						{/* Template Specific Fields */}
						{activeTemplate === "bug-report" && (
							<div className="bg-blue-50 border-l-4 border-[#281d80] p-6 rounded-r-lg space-y-4 animate-fade-in-down">
								<h4 className="text-[#281d80] font-bold text-sm uppercase tracking-wide">
									🐛 Bug Report Details
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="browserVersion"
											className="block text-xs font-semibold text-gray-700 mb-1"
										>
											Browser Version
										</label>
										<input
											id="browserVersion"
											type="text"
											disabled={isSubmitting}
											value={templateFields["bug-report"].browser}
											onChange={(e) =>
												setTemplateFields((prev) => ({
													...prev,
													"bug-report": {
														...prev["bug-report"],
														browser: e.target.value,
													},
												}))
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#281d80]"
										/>
									</div>
									<div>
										<label
											htmlFor="osVersion"
											className="block text-xs font-semibold text-gray-700 mb-1"
										>
											OS
										</label>
										<input
											id="osVersion"
											type="text"
											disabled={isSubmitting}
											value={templateFields["bug-report"].os}
											onChange={(e) =>
												setTemplateFields((prev) => ({
													...prev,
													"bug-report": {
														...prev["bug-report"],
														os: e.target.value,
													},
												}))
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#281d80]"
										/>
									</div>
								</div>
							</div>
						)}

						{activeTemplate === "how-to" && (
							<div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg space-y-4 animate-fade-in-down">
								<h4 className="text-green-800 font-bold text-sm uppercase tracking-wide">
									📘 Context
								</h4>
								<div>
									<label
										htmlFor="documentationLink"
										className="block text-xs font-semibold text-gray-700 mb-1"
									>
										Documentation Link
									</label>
									<input
										id="documentationLink"
										type="text"
										disabled={isSubmitting}
										value={templateFields["how-to"].documentationLink}
										onChange={(e) =>
											setTemplateFields((prev) => ({
												...prev,
												"how-to": {
													...prev["how-to"],
													documentationLink: e.target.value,
												},
											}))
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-green-600"
									/>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-[#281d80] hover:bg-[#1f1566] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#281d80] transition-all shadow-md hover:shadow-lg"
						>
							{isSubmitting ? "Posting..." : "Post Your Question"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AskQuestionPage;
