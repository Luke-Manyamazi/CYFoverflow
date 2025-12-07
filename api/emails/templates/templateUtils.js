// api/emails/templates/templateUtils.js
export const truncateContent = (content, maxLength = 300) => {
	if (content.length <= maxLength) return content;
	return content.substring(0, maxLength) + "...";
};

export const formatDate = (date = new Date()) => {
	return date.toLocaleString();
};
