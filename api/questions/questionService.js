import * as answerRepository from "../answers/answerRepository.js";
import * as authRepository from "../auth/authRepository.js";
import * as notificationService from "../notifications/notificationService.js";
import logger from "../utils/logger.js";

import * as repository from "./questionRepository.js";

export const createQuestion = async (
	userId,
	title,
	content,
	templateType,
	browser = null,
	os = null,
	documentationLink = null,
	labelId = [],
) => {
	if (!title) {
		throw new Error("Title is required");
	}

	const trimmedTitle = title.trim();
	const MAX_TITLE_LENGTH = 100;
	const MIN_TITLE_LENGTH = 10;

	if (trimmedTitle.length < MIN_TITLE_LENGTH) {
		throw new Error(
			`Title must be at least ${MIN_TITLE_LENGTH} characters long`,
		);
	}

	if (trimmedTitle.length > MAX_TITLE_LENGTH) {
		throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
	}
	if (!content || (typeof content === "string" && !content.trim())) {
		throw new Error("Content is required");
	}

	if (labelId == null) labelId = [];
	if (!Array.isArray(labelId)) throw new Error("Labels must be an array");

	if (labelId.length > 3) throw new Error("Maximum 3 labels allowed");

	return repository.createQuestionDB(
		trimmedTitle,
		typeof content === "string" ? content.trim() : content,
		templateType,
		userId,
		browser,
		os,
		documentationLink,
		labelId,
	);
};

export const getAllQuestions = async (limit = null, page = null) => {
	return repository.getAllQuestionsDB(limit, page);
};

export const getTotalQuestionsCount = async () => {
	return repository.getTotalQuestionsCountDB();
};

export const getQuestionById = async (id) => {
	const question = await repository.getQuestionByIdDB(id);
	if (!question) {
		logger.error("Error not found Question");
	}
	return question;
};

export const getQuestionsByUserId = async (userId) => {
	return repository.getQuestionsByUserIdDB(userId);
};
export const updateQuestion = async (
	idOrSlug,
	userId,
	title,
	content,
	templateType,
	browser = null,
	os = null,
	documentationLink = null,
	labelId = [],
) => {
	const question = await repository.getQuestionByIdDB(idOrSlug);
	if (!question) {
		throw new Error("Question not found");
	}
	if (!title) {
		throw new Error("title is required");
	}

	const trimmedTitle = title.trim();
	const MAX_TITLE_LENGTH = 100;
	const MIN_TITLE_LENGTH = 10;

	if (trimmedTitle.length < MIN_TITLE_LENGTH) {
		throw new Error(
			`Title must be at least ${MIN_TITLE_LENGTH} characters long`,
		);
	}

	if (trimmedTitle.length > MAX_TITLE_LENGTH) {
		throw new Error(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
	}
	if (!content) {
		throw new Error("content is required");
	}
	if (question.user_id !== userId) {
		throw new Error("You are not authorised to edit");
	}

	const updatedQuestion = await repository.updateQuestionDB(
		question.id,
		trimmedTitle,
		content,
		templateType,
		browser,
		os,
		documentationLink,
		labelId,
	);

	try {
		const answers = await answerRepository.getAnswerByQuestionIdDB(question.id);
		if (answers && answers.length > 0) {
			const answererIds = [
				...new Set(
					answers
						.map((answer) => answer.user_id)
						.filter((answererId) => answererId !== question.user_id),
				),
			];

			const questionAuthor = await authRepository.findUserById(
				question.user_id,
			);
			const questionAuthorName = questionAuthor?.name || "The question author";

			for (const answererId of answererIds) {
				notificationService
					.createNotification({
						userId: answererId,
						type: "question_updated",
						message: `${questionAuthorName} updated the question: "${trimmedTitle}"`,
						relatedQuestionId: question.id,
					})
					.catch((error) => {
						logger.error("Failed to create notification for answerer", {
							answererId,
							questionId: question.id,
							error: error.message,
						});
					});
			}
		}
	} catch (error) {
		logger.error("Error creating notifications for question update", {
			questionId: question.id,
			error: error.message,
		});
	}

	return updatedQuestion;
};

export const deleteQuestion = async (idOrSlug, userId) => {
	const question = await repository.getQuestionByIdDB(idOrSlug);
	if (!question) {
		throw new Error("Question not found");
	}
	if (question.user_id !== userId) {
		throw new Error("You are not authorised to delete");
	}

	try {
		const answers = await answerRepository.getAnswerByQuestionIdDB(question.id);
		if (answers && answers.length > 0) {
			const answererIds = [
				...new Set(
					answers
						.map((answer) => answer.user_id)
						.filter((answererId) => answererId !== question.user_id),
				),
			];

			const questionAuthor = await authRepository.findUserById(
				question.user_id,
			);
			const questionAuthorName = questionAuthor?.name || "The question author";

			for (const answererId of answererIds) {
				notificationService
					.createNotification({
						userId: answererId,
						type: "question_deleted",
						message: `${questionAuthorName} deleted the question: "${question.title}"`,
						relatedQuestionId: question.id,
					})
					.catch((error) => {
						logger.error("Failed to create notification for answerer", {
							answererId,
							questionId: question.id,
							error: error.message,
						});
					});
			}
		}
	} catch (error) {
		logger.error("Error creating notifications for question deletion", {
			questionId: question.id,
			error: error.message,
		});
	}

	return repository.deleteQuestionDB(question.id);
};

export const getAllLabels = async () => {
	return repository.getAllLabelsDB();
};

export const searchQuestionsByLabels = async (labelId = []) => {
	if (!Array.isArray(labelId)) throw new Error("labelIds must be an array");
	if (labelId.length === 0) throw new Error("At least one label ID required");

	return repository.searchQuestionsByLabelsDB(labelId);
};

export const searchQuestionsByText = async (
	searchTerm,
	limit = null,
	page = null,
) => {
	if (!searchTerm || !searchTerm.trim()) {
		throw new Error("Search term is required");
	}

	return repository.searchQuestionsByTextDB(searchTerm.trim(), limit, page);
};

export const getSearchQuestionsCount = async (searchTerm) => {
	if (!searchTerm || !searchTerm.trim()) {
		return 0;
	}

	return repository.getSearchQuestionsCountDB(searchTerm.trim());
};

export const markQuestionSolved = async (idOrSlug, userId, isSolved) => {
	const question = await repository.getQuestionByIdDB(idOrSlug);

	if (!question) {
		throw new Error("Question not found");
	}

	if (question.user_id !== userId) {
		throw new Error("You are not authorised to change solved status");
	}

	return repository.updateSolvedStatusDB(question.id, isSolved);
};
