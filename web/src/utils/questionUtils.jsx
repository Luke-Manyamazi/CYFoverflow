/**
 * Capitalizes the first letter of each word in a title
 * @param {string} title - Title string to capitalize
 * @returns {string} - Capitalized title
 */
export function capitalizeTitle(title) {
	if (!title) return title;

	return title
		.toLowerCase()
		.split(" ")
		.map((word) => {
			if (word.length === 0) return word;
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}

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

	return questions.filter((question) => {
		if (question.title?.toLowerCase().includes(term)) return true;

		if ((question.content || question.body)?.toLowerCase().includes(term))
			return true;

		if (
			question.author_name?.toLowerCase().includes(term) ||
			question.author?.name?.toLowerCase().includes(term)
		)
			return true;

		if (question.labels && Array.isArray(question.labels)) {
			const labelMatch = question.labels.some((label) =>
				label.name?.toLowerCase().includes(term),
			);
			if (labelMatch) return true;
		}

		return false;
	});
};

/**
 * Highlights search terms in text
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Search term to highlight
 * @returns {JSX.Element|string} - Text with highlighted search terms
 */
export const highlightSearchTerm = (text, searchTerm) => {
	if (!text || !searchTerm || !searchTerm.trim()) {
		return text;
	}

	const term = searchTerm.trim();
	const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const regex = new RegExp(`(${escapedTerm})`, "gi");
	const parts = text.split(regex);

	const filteredParts = parts.filter((part) => part.length > 0);

	return filteredParts.map((part, index) => {
		if (part.toLowerCase() === term.toLowerCase()) {
			return (
				<mark key={index} className="bg-yellow-200 px-1 rounded">
					{part}
				</mark>
			);
		}
		return part;
	});
};
