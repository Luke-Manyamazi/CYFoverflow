/**
 * Extracts the first meaningful line from HTML content for question previews
 * @param {string} html - HTML content string
 * @returns {string} - Preview text (max 100 chars)
 */
export const getFirstLinePreview = (html) => {
	if (!html) return "No description provided";

	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = html;

	tempDiv.querySelectorAll("pre").forEach((el) => el.remove());
	tempDiv.querySelectorAll("code").forEach((el) => el.remove());

	tempDiv.querySelectorAll("h3").forEach((el) => el.remove());
	tempDiv.querySelectorAll("hr").forEach((el) => el.remove());

	const paragraphs = tempDiv.querySelectorAll("p");

	for (let p of paragraphs) {
		const text = p.textContent.trim();

		if (
			text &&
			!text.includes("Problem Summary") &&
			!text.includes("What I've Already Tried") &&
			!text.includes("Describe your problem here") &&
			!text.includes("Explain what you tried here") &&
			!text.includes("Provide a concise summary") &&
			!text.includes("Explain your solution") &&
			!text.includes("Any additional context") &&
			text.length > 5
		) {
			return text.length > 100 ? text.substring(0, 100) + "..." : text;
		}
	}

	let fallbackText = tempDiv.textContent || tempDiv.innerText || "";
	fallbackText = fallbackText
		.replace(/Problem Summary/g, "")
		.replace(/What I've Already Tried/g, "")
		.replace(/Answer Summary/g, "")
		.replace(/Solution/g, "")
		.replace(/Additional Notes/g, "")
		.replace(/\/\/ Your code here/g, "")
		.replace(/\/\/ Your code solution here/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if (!fallbackText || fallbackText.length < 10) {
		return "Question contains code only. Click to view full details.";
	}

	const firstSentence = fallbackText.split(".")[0];
	if (firstSentence && firstSentence.length > 10) {
		return firstSentence.length > 100
			? firstSentence.substring(0, 100) + "..."
			: firstSentence;
	}

	return fallbackText.length > 100
		? fallbackText.substring(0, 100) + "..."
		: fallbackText || "No description provided";
};

/**
 * Filters questions based on search term
 * @param {Array} questions - Array of question objects
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} - Filtered array of questions
 */
export const filterQuestions = (questions, searchTerm) => {
	if (!searchTerm || !searchTerm.trim()) {
		return questions;
	}

	const term = searchTerm.toLowerCase().trim();

	return questions.filter(
		(question) =>
			question.title?.toLowerCase().includes(term) ||
			question.body?.toLowerCase().includes(term) ||
			question.content?.toLowerCase().includes(term) ||
			question.author_name?.toLowerCase().includes(term) ||
			question.author?.name?.toLowerCase().includes(term),
	);
};
