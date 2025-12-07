// api/emails/templates/templateUtils.js
export const truncateContent = (content, maxLength = 300) => {
	if (content.length <= maxLength) return content;
	return content.substring(0, maxLength) + "...";
};

export const getQuestionUrl = (questionId, appUrl) => {
	return `${appUrl || "https://cyf.academy"}/questions/${questionId}`;
};

export const formatDate = (date = new Date()) => {
	return date.toLocaleString();
};
