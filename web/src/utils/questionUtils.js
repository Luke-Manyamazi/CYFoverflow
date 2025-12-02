/**
 * Extracts the first meaningful line from HTML content for question previews
 * @param {string} html - HTML content string
 * @returns {string} - Preview text (max 100 chars)
 */
export const getFirstLinePreview = (html) => {
	if (!html) return "No description provided";

	// Create a temporary div to parse HTML
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = html;

	// Remove template-specific elements that don't contain user content
	tempDiv.querySelectorAll("h3").forEach((el) => el.remove());
	tempDiv.querySelectorAll("hr").forEach((el) => el.remove());

	// Get all paragraph elements
	const paragraphs = tempDiv.querySelectorAll("p");

	// Find the first paragraph that has actual user content (not empty or placeholder)
	for (let p of paragraphs) {
		const text = p.textContent.trim();

		// Skip empty paragraphs or template placeholders
		if (
			text &&
			!text.includes("Problem Summary") &&
			!text.includes("What I've Already Tried") &&
			!text.includes("Describe your problem here") &&
			!text.includes("Explain what you tried here") &&
			text.length > 5
		) {
			// Minimum content length
			// Return first meaningful content, truncated if needed
			return text.length > 100 ? text.substring(0, 100) + "..." : text;
		}
	}

	// If no meaningful paragraphs found, try to get any text content
	let fallbackText = tempDiv.textContent || tempDiv.innerText || "";
	fallbackText = fallbackText
		.replace(/Problem Summary/g, "")
		.replace(/What I've Already Tried/g, "")
		.replace(/\/\/ Your code here/g, "")
		.replace(/\s+/g, " ")
		.trim();

	// Get first sentence or first 80 chars
	const firstSentence = fallbackText.split(".")[0];
	if (firstSentence && firstSentence.length > 10) {
		return firstSentence.length > 100
			? firstSentence.substring(0, 100) + "..."
			: firstSentence;
	}

	// Final fallback
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
