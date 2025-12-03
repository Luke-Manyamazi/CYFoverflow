import { Editor } from "@tinymce/tinymce-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

import { TEMPLATES } from "./templates";

const AskQuestionPage = () => {
	const navigate = useNavigate();
	const { token, isLoggedIn } = useAuth();

	const [activeTemplate, setActiveTemplate] = useState(null);

	const [initialContent, setInitialContent] = useState("");

	const [content, setContent] = useState("");
	const [title, setTitle] = useState("");

	const [charCount, setCharCount] = useState(0);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const editorRef = useRef(null);

	const [labels, setLabels] = useState([]);
	const [selectedLabels, setSelectedLabels] = useState([]);

	const [templateFields, setTemplateFields] = useState({
		"bug-report": { browser: "", os: "" },
		"how-to": { documentationLink: "" },
	});

	useEffect(() => {
		if (activeTemplate) {
			fetchLabels();
		}
	}, [activeTemplate]);

	const fetchLabels = async () => {
		try {
			const response = await fetch("/api/questions/labels/all");
			if (response.ok) {
				const data = await response.json();
				setLabels(data);
			}
		} catch (err) {
			console.error("Error fetching labels:", err);
		}
	};

	const handleTemplateSelect = (template) => {
		setInitialContent(template.content);

		setContent(template.content);

		setActiveTemplate(template.id);

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
			setSelectedLabels([]);
		}
	};

	const handleLabelToggle = (labelId) => {
		setSelectedLabels((prev) => {
			if (prev.includes(labelId)) {
				return prev.filter((id) => id !== labelId);
			} else {
				if (prev.length >= 3) {
					setError("You can select a maximum of 3 labels.");
					return prev;
				}
				setError(null);
				return [...prev, labelId];
			}
		});
	};

	const handleEditorChange = (newContent, editor) => {
		setContent(newContent);

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
		const htmlContent = editorRef.current.getContent();

		if (!title.trim()) {
			setError("Please enter a title for your question.");
			return;
		}

		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = htmlContent;

		tempDiv.querySelectorAll("pre").forEach((el) => el.remove());
		tempDiv.querySelectorAll("code").forEach((el) => el.remove());
		tempDiv.querySelectorAll("h3").forEach((el) => el.remove());
		tempDiv.querySelectorAll("hr").forEach((el) => el.remove());

		const textOnly = tempDiv.textContent.trim();
		const hasMeaningfulText =
			textOnly.length > 20 &&
			!textOnly.match(
				/^(Problem Summary|What I've Already Tried|Describe|Explain|Provide|Any additional).*$/i,
			);

		if (!hasMeaningfulText) {
			setError(
				"Please provide a description explaining your question. Code blocks alone are not sufficient.",
			);
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

		const parser = new DOMParser();
		const doc = parser.parseFromString(content, "text/html");

		doc.querySelectorAll(".template-placeholder").forEach((el) => {
			el.classList.remove("template-placeholder");
			el.removeAttribute("data-placeholder");
		});

		const cleanContent = doc.body.innerHTML;

		const questionData = {
			title: title,
			content: cleanContent,
			templateType: activeTemplate || "general-question",
			browser: metaData.browser || null,
			os: metaData.os || null,
			documentationLink: metaData.documentationLink || null,
			labelId: selectedLabels,
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

						{/* Labels Selection */}
						<fieldset>
							<legend className="block text-sm font-semibold text-gray-700 mb-2">
								Tags (Optional - Select up to 3)
							</legend>
							<div className="flex flex-wrap gap-2">
								{labels.map((label) => (
									<button
										key={label.id}
										type="button"
										onClick={() => handleLabelToggle(label.id)}
										disabled={isSubmitting}
										className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
											selectedLabels.includes(label.id)
												? "bg-[#281d80] text-white shadow-md"
												: "bg-gray-100 text-gray-700 hover:bg-gray-200"
										}`}
									>
										{label.name}
									</button>
								))}
							</div>
							{selectedLabels.length > 0 && (
								<p className="mt-2 text-xs text-gray-500">
									{selectedLabels.length} of 3 labels selected
								</p>
							)}
						</fieldset>

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
							className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-lg text-white bg-[#281d80] hover:bg-[#1f1566] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#281d80] transition-all shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
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
