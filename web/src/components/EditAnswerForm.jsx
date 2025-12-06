import { Editor } from "@tinymce/tinymce-react";
import { useRef, useState } from "react";

import { useAuth } from "../contexts/useAuth";

const EditAnswerForm = ({ answer, onCancel, onSuccess, initialContent }) => {
	const { token } = useAuth();
	const editorRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async () => {
		if (!editorRef.current) return;

		const content = editorRef.current.getContent().trim();

		if (!content) {
			setError("Answer content cannot be empty");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await fetch(`/api/answers/${answer.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content }),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to update answer");
			}

			const updatedAnswer = await response.json();
			onSuccess(updatedAnswer);
		} catch (err) {
			console.error("Error updating answer:", err);
			setError(err.message || "Failed to update answer. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4 animate-fade-in">
			{/* Author Info */}
			<div className="flex items-center gap-3 mb-4 opacity-75">
				<div className="w-10 h-10 bg-[#281d80] rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
					{answer.author_name
						? answer.author_name.charAt(0).toUpperCase()
						: "A"}
				</div>
				<div>
					<p className="font-semibold text-gray-900">
						{answer.author_name || "Anonymous"}
					</p>
					<p className="text-xs text-gray-500 uppercase tracking-wide">
						Editing Mode
					</p>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
					{error}
				</div>
			)}

			{/* TinyMCE Editor */}
			<div className="border border-gray-200 rounded-lg overflow-hidden">
				<Editor
					id={`answer-editor-${answer.id}`}
					tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
					onInit={(evt, editor) => (editorRef.current = editor)}
					initialValue={initialContent ?? answer.content ?? ""}
					init={{
						height: 400,
						menubar: false,
						plugins: [
							"advlist",
							"autolink",
							"lists",
							"link",
							"image",
							"charmap",
							"preview",
							"anchor",
							"searchreplace",
							"visualblocks",
							"code",
							"fullscreen",
							"insertdatetime",
							"media",
							"table",
							"help",
							"wordcount",
						],
						toolbar:
							"undo redo | blocks | " +
							"bold italic forecolor | alignleft aligncenter " +
							"alignright alignjustify | bullist numlist outdent indent | " +
							"removeformat | help",
						content_style:
							"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
					}}
				/>
			</div>

			{/* Buttons */}
			<div className="flex justify-end gap-3 mt-4">
				<button
					onClick={onCancel}
					disabled={loading}
					className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#281d80] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#281d80] transition-colors cursor-pointer"
				>
					Cancel
				</button>
				<button
					onClick={handleSubmit}
					disabled={loading}
					className="px-4 py-2 text-sm font-medium text-white bg-[#281d80] rounded-lg hover:bg-[#1f1566] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#281d80] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm"
				>
					{loading ? (
						<>
							<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</button>
			</div>
		</div>
	);
};

export default EditAnswerForm;
