import { Editor } from "@tinymce/tinymce-react";
import { useState } from "react";

import { useAuth } from "../contexts/useAuth";

import EditAnswerForm from "./EditAnswerForm";

function Answer({ answer, onDelete }) {
	const { isLoggedIn, user, token } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteError, setDeleteError] = useState("");
	const [displayContent, setDisplayContent] = useState(
		answer.content || answer.body,
	);

	const isAuthor = isLoggedIn && user && user.id === answer.user_id;

	const handleDelete = async () => {
		if (!window.confirm("Are you sure you want to delete this answer?")) return;

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

			if (onDelete) onDelete();
		} catch (err) {
			console.error("Error deleting answer:", err);
			setDeleteError(err.message || "Failed to delete answer.");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleEditSuccess = (updatedAnswer) => {
		setDisplayContent(updatedAnswer.content);

		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<EditAnswerForm
				answer={answer}
				initialContent={displayContent}
				onCancel={() => setIsEditing(false)}
				onSuccess={handleEditSuccess}
			/>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4">
			<div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
				{/* User Info */}
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#281d80] rounded-full flex items-center justify-center text-white text-sm sm:text-base font-semibold">
						{answer.author_name
							? answer.author_name.charAt(0).toUpperCase()
							: "A"}
					</div>
					<div>
						<p className="text-sm sm:text-base font-semibold text-gray-900">
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
								<span className="ml-1 sm:ml-2 italic">(edited)</span>
							)}
						</p>
					</div>
				</div>

				{/* Author Controls */}
				{isAuthor && (
					<div className="flex flex-wrap items-center gap-2">
						<span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
							Your answer
						</span>

						<button
							onClick={() => setIsEditing(true)}
							className="px-2 sm:px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors cursor-pointer whitespace-nowrap"
							title="Edit answer"
						>
							Edit
						</button>

						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className="px-2 sm:px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
							title="Delete answer"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</button>
					</div>
				)}
			</div>

			{/* READ-ONLY CONTENT DISPLAY */}
			<div className="answer-content-display">
				<Editor
					key={displayContent}
					tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
					initialValue={displayContent}
					disabled={true}
					init={{
						height: "auto",
						menubar: false,
						toolbar: false,
						statusbar: false,
						plugins: ["autoresize", "codesample"],
						content_style: `
                    body {
                        font-family: ui-sans-serif, system-ui, sans-serif;
                        font-size: 14px;
                        margin: 0;
                        padding: 0;
                        color: #374151;
                    }
                    p { margin-bottom: 1em; }
                    pre {
                        background: #f4f4f5;
                        padding: 10px;
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                `,
					}}
				/>
			</div>

			{/* Delete Error Message */}
			{deleteError && (
				<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-600 text-sm">{deleteError}</p>
				</div>
			)}
		</div>
	);
}

export default Answer;
