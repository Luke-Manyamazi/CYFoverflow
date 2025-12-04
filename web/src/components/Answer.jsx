import { Editor } from "@tinymce/tinymce-react";
import { useState, useRef } from "react";

import { useAuth } from "../contexts/useAuth";

function Answer({ answer, onDelete }) {
	const editorRef = useRef(null);
	const { isLoggedIn, user, token } = useAuth();
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	const isAuthor = isLoggedIn && user && user.id === answer.user_id;

	const handleDelete = async () => {
		if (!window.confirm("Are you sure you want to delete this answer?")) {
			return;
		}

		setIsDeleting(true);
		setDeleteError("");

		try {
			const response = await fetch(`/api/answers/${answer.id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to delete answer");
			}

			if (onDelete) {
				onDelete();
			}
		} catch (err) {
			console.error("Error deleting answer:", err);
			setDeleteError(
				err.message || "Failed to delete answer. Please try again.",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-[#281d80] rounded-full flex items-center justify-center text-white font-semibold">
						{answer.author_name
							? answer.author_name.charAt(0).toUpperCase()
							: "A"}
					</div>
					<div>
						<p className="font-semibold text-gray-900">
							{answer.author_name || "Anonymous"}
						</p>
						<p className="text-xs text-gray-500">
							{new Date(answer.created_at).toLocaleDateString("en-US", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
							{answer.updated_at !== answer.created_at && (
								<span className="ml-2 italic">(edited)</span>
							)}
						</p>
					</div>
				</div>
				{isAuthor && (
					<div className="flex items-center gap-2">
						<span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
							Your answer
						</span>
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							title="Delete answer"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</button>
					</div>
				)}
			</div>

			<div className="answer-content-display">
				<Editor
					tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
					onInit={(evt, editor) => (editorRef.current = editor)}
					initialValue={answer.content || answer.body}
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

			{deleteError && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-600 text-sm">{deleteError}</p>
				</div>
			)}
		</div>
	);
}

export default Answer;
