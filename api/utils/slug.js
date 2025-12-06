/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The generated slug
 */
export function generateSlug(text) {
	if (!text) return "";

	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/--+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

/**
 * Generate a unique slug by appending a number if needed
 * @param {string} baseSlug - The base slug
 * @param {Function} checkExists - Function to check if slug exists (should return boolean)
 * @returns {Promise<string>} - The unique slug
 */
export async function generateUniqueSlug(baseSlug, checkExists) {
	let slug = baseSlug;
	let counter = 1;

	while (await checkExists(slug)) {
		slug = `${baseSlug}-${counter}`;
		counter++;
	}

	return slug;
}
