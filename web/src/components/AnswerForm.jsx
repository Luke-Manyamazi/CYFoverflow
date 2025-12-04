import { Editor } from "@tinymce/tinymce-react";
import { useState, useRef } from "react";

const ANSWER_TEMPLATE = `
	<div data-template="answer">
		<h3>Answer Summary</h3>
		<p class="template-placeholder" data-placeholder="Provide a concise summary of your answer..."></p>
		<hr />
		<h3>Solution</h3>
		<p class="template-placeholder" data-placeholder="Explain your solution step by step..."></p>
		<pre class="language-javascript"><code>// Your code solution here</code></pre>
		<hr />
		<h3>Additional Notes</h3>
		<p class="template-placeholder" data-placeholder="Any additional context, tips, or warnings..."></p>
	</div>
`;

function AnswerForm({ questionId, onSuccess, onCancel, token }) {
	const [answerContent, setAnswerContent] = useState(ANSWER_TEMPLATE);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [charCount, setCharCount] = useState(0);
	const editorRef = useRef(null);

	const handleEditorChange = (newContent, editor) => {
		setAnswerContent(newContent);
		const textLength = editor.getContent({ format: "text" }).trim().length;
		setCharCount(textLength);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitError("");

		const plainText = editorRef.current?.getContent({ format: "text" });
		const htmlContent = editorRef.current?.getContent();

		if (!plainText || plainText.trim().length < 50) {
			setSubmitError(
				"Your answer is too short. Please provide at least 50 characters of detail.",
			);
			return;
		}

		// Check for meaningful content (similar to question validation)
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
				/^(Answer Summary|Solution|Additional Notes|Provide|Explain|Any additional).*$/i,
			);

		if (!hasMeaningfulText) {
			setSubmitError(
				"Please provide a detailed explanation. Template placeholders alone are not sufficient.",
			);
			return;
		}

		setIsSubmitting(true);

		const parser = new DOMParser();
		const doc = parser.parseFromString(answerContent, "text/html");

		doc.querySelectorAll(".template-placeholder").forEach((el) => {
			el.classList.remove("template-placeholder");
			el.removeAttribute("data-placeholder");
		});

		const cleanContent = doc.body.innerHTML;

		try {
			const response = await fetch(`/api/answers`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					content: cleanContent,
					questionId: questionId,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to submit answer");
			}

			setAnswerContent(ANSWER_TEMPLATE);
			if (onSuccess) onSuccess();
		} catch (err) {
			console.error("Error submitting answer:", err);
			setSubmitError(
				err.message || "Failed to submit answer. Please try again.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
			<h2 className="text-2xl font-bold text-gray-900 mb-4">Your Answer</h2>
			<form onSubmit={handleSubmit}>
				<div className="rounded-lg overflow-hidden border-2 border-gray-200 focus-within:border-[#281d80] focus-within:ring-2 focus-within:ring-[#281d80]/20 transition-all">
					<Editor
						tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
						onInit={(evt, editor) => (editorRef.current = editor)}
						key="answer-editor"
						initialValue={ANSWER_TEMPLATE}
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
								// Hide placeholder CSS when content is added
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

				<div className="flex justify-end mt-2">
					<span
						className={`text-xs ${charCount < 50 ? "text-red-500" : "text-gray-500"}`}
					>
						{charCount} characters (min 50)
					</span>
				</div>

				{submitError && (
					<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<p className="text-red-600 text-sm">{submitError}</p>
					</div>
				)}

				<div className="flex gap-4 mt-6">
					<button
						type="submit"
						disabled={isSubmitting}
						className="bg-[#281d80] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1f1566] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? "Submitting..." : "Post Answer"}
					</button>
					<button
						type="button"
						onClick={onCancel}
						disabled={isSubmitting}
						className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-50"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}

export default AnswerForm;
