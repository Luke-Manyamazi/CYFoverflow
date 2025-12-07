import { Editor } from "@tinymce/tinymce-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/useAuth";

const EditQuestion = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { id: identifier } = useParams();
	const authContext = useAuth();
	const editorRef = useRef(null);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const MAX_TITLE_LENGTH = 100;

	const [metaData, setMetaData] = useState({
		templateType: null,
		browser: "",
		os: "",
		documentationLink: "",
		labelId: [],
	});

	const [labels, setLabels] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const initializeFields = (data) => {
		// Title
		setTitle(data.title || "");

		// Content / Body
		setDescription(data.content || data.body || "");

		// Helper to find value in data (checking both camelCase and snake_case)
		const getVal = (key1, key2) =>
			data[key1] !== undefined ? data[key1] : data[key2];

		// Extract Labels
		let labelIds = [];
		if (Array.isArray(data.labels)) {
			labelIds = data.labels.map((l) => l.id);
		} else if (Array.isArray(data.labelId)) {
			labelIds = data.labelId;
		} else if (Array.isArray(data.label_id)) {
			labelIds = data.label_id;
		}

		setMetaData({
			templateType: getVal("templateType", "template_type") || "general",
			browser: getVal("browser", "browser") || "",
			os: getVal("os", "os") || "",
			documentationLink:
				getVal("documentationLink", "documentation_link") || "",
			labelId: labelIds,
		});
	};

	useEffect(() => {
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
		fetchLabels();
	}, []);

	useEffect(() => {
		const stateData = location.state?.questionData;
		if (stateData) {
			initializeFields(stateData);
		} else {
			const fetchQuestion = async () => {
				setLoading(true);
				try {
					const res = await fetch(`/api/questions/${identifier}`);
					if (!res.ok) throw new Error("Could not fetch question data");

					const data = await res.json();
					initializeFields(data);
				} catch (err) {
					console.error("Fetch Error:", err);
					setError(err.message);
				} finally {
					setLoading(false);
				}
			};
			fetchQuestion();
		}
	}, [identifier, location.state]);

	const handleLabelToggle = (labelId) => {
		setMetaData((prev) => {
			const currentLabels = prev.labelId || [];
			if (currentLabels.includes(labelId)) {
				return {
					...prev,
					labelId: currentLabels.filter((id) => id !== labelId),
				};
			} else {
				if (currentLabels.length >= 3) {
					setError("You can select a maximum of 3 labels.");
					return prev;
				}
				setError("");
				return {
					...prev,
					labelId: [...currentLabels, labelId],
				};
			}
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const token = authContext.token || localStorage.getItem("token");
		if (!token) {
			setError("Authentication token missing. Please log in.");
			setLoading(false);
			return;
		}

		if (!title.trim()) {
			setError("Please enter a title for your question.");
			setLoading(false);
			return;
		}

		if (title.trim().length > MAX_TITLE_LENGTH) {
			setError(`Title must be ${MAX_TITLE_LENGTH} characters or less.`);
			setLoading(false);
			return;
		}

		if (title.trim().length < 10) {
			setError("Title must be at least 10 characters long.");
			setLoading(false);
			return;
		}

		if (!description.trim()) {
			setError("Question content cannot be empty.");
			setLoading(false);
			return;
		}

		const cleanLabelIds = (metaData.labelId || [])
			.map((tagId) => parseInt(tagId, 10))
			.filter((tagId) => !isNaN(tagId));

		if (cleanLabelIds.length === 0) {
			setError("Please select at least one tag/label for your question.");
			setLoading(false);
			return;
		}

		const payload = {
			title,
			content: description,
			templateType: metaData.templateType, // Sends what we received
			browser: metaData.browser,
			os: metaData.os,
			documentationLink: metaData.documentationLink,
			labelId: cleanLabelIds,
		};

		try {
			const response = await fetch(`/api/questions/${identifier}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => null);

				throw new Error(errorData?.error || "Server rejected the update");
			}

			const updatedQuestion = await response.json();
			// Use slug if available, otherwise fall back to ID
			const redirectIdentifier =
				updatedQuestion.slug || updatedQuestion.id || identifier;
			navigate(`/questions/${redirectIdentifier}`);
		} catch (err) {
			console.error("Update Failed:", err);

			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
				<div className="flex flex-col md:flex-row gap-4 md:gap-8">
					<Sidebar />

					<main className="flex-1 min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
							Edit Question
						</h1>

						{error && (
							<div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
								<strong>Error:</strong> {error}
								<div className="text-sm mt-2">
									{/* Helper hint for development */}
									{error.includes("Server rejected") &&
										" (Check your Backend Terminal for the detailed crash log)"}
								</div>
							</div>
						)}

						{loading && !title ? (
							<div className="text-center py-4">Loading question...</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-6">
								<div>
									<label
										htmlFor="title"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Title
									</label>
									<input
										type="text"
										id="title"
										value={title}
										maxLength={MAX_TITLE_LENGTH}
										onChange={(e) => setTitle(e.target.value)}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#281d80] focus:border-transparent outline-none transition-all"
										required
									/>
									<div className="mt-1 flex justify-end">
										<p
											className={`text-xs ${
												title.length > MAX_TITLE_LENGTH
													? "text-red-600"
													: title.length > MAX_TITLE_LENGTH * 0.9
														? "text-orange-600"
														: "text-gray-500"
											}`}
										>
											{title.length}/{MAX_TITLE_LENGTH}
										</p>
									</div>
								</div>

								<div>
									<fieldset className="block text-sm font-medium text-gray-700 mb-1">
										Description
									</fieldset>
									<Editor
										tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js"
										onInit={(evt, editor) => (editorRef.current = editor)}
										value={description}
										onEditorChange={(newValue) => setDescription(newValue)}
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
												"code",
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

								<div>
									<fieldset>
										<legend className="block text-sm font-semibold text-gray-700 mb-2">
											Tags <span className="text-red-500">*</span> (Required -
											Select 1 to 3)
										</legend>
										<div className="flex flex-wrap gap-2">
											{labels.map((label) => (
												<button
													key={label.id}
													type="button"
													onClick={() => handleLabelToggle(label.id)}
													disabled={loading}
													className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
														metaData.labelId.includes(label.id)
															? "bg-[#281d80] text-white shadow-md"
															: "bg-gray-100 text-gray-700 hover:bg-gray-200"
													}`}
												>
													{label.name}
												</button>
											))}
										</div>
										<p className="mt-2 text-xs text-gray-500">
											{metaData.labelId.length > 0
												? `${metaData.labelId.length} of 3 labels selected`
												: "Please select at least one tag"}
										</p>
									</fieldset>
								</div>

								<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
									<button
										type="submit"
										disabled={loading}
										className="bg-[#281d80] text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#1f1566] transition-all disabled:opacity-50 cursor-pointer"
									>
										{loading ? "Updating..." : "Update Question"}
									</button>
									<button
										type="button"
										onClick={() => navigate(-1)}
										className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all cursor-pointer"
									>
										Cancel
									</button>
								</div>
							</form>
						)}
					</main>
				</div>
			</div>
		</div>
	);
};

export default EditQuestion;
