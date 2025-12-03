import { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

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
	const editorRef = useRef(null);

	const handleEditorChange = (newContent) => {
		setAnswerContent(newContent);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitError("");

		const plainText = editorRef.current?.getContent({ format: "text" });

		if (!plainText || plainText.trim().length < 20) {
			setSubmitError("Your answer is too short. Please provide more detail.");
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
			//TODO: Ask Sheetal for the endpoint
			const response = await fetch(`/api/questions/${questionId}/answers`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					content: cleanContent,
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
			setSubmitError(err.message || "Failed to submit answer. Please try again.");
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
								.template-placeholder { color: #9ca3af; font-style: italic; }
							`,
						}}
					/>
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

