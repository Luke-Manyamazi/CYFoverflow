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
	if (!content) {
		throw new Error("Content is required");
	}

	if (!Array.isArray(labelId)) throw new Error("Labels must be an array");
	if (labelId.length < 1) throw new Error("At least 1 label required");
	if (labelId.length > 3) throw new Error("Maximum 3 labels allowed");

	return repository.createQuestionDB(
		title.trim(),
		content.trim(),
		templateType,
		userId,
		browser,
		os,
		documentationLink,
		labelId,
	);
};

export const getAllQuestions = async () => {
	return repository.getAllQuestionsDB();
};

export const getQuestionById = async (id) => {
	const question = await repository.getQuestionByIdDB(id);
	if (!question) {
		logger.error("Error not found Question");
	}
	return question;
};

export const updateQuestion = async (
	id,
	userId,
	title,
	content,
	templateType,
	browser = null,
	os = null,
	documentationLink = null,
	labelId = [],
) => {
	const updated = await repository.getQuestionByIdDB(id);
	if (!updated) {
		throw new Error("Question not found");
	}
	if (!title) {
		throw new Error("title is required");
	}
	if (!content) {
		throw new Error("content is required");
	}
	if (updated.user_id !== userId) {
		throw new Error("You are not authorised to edit");
	}
	return repository.updateQuestionDB(
		id,
		title,
		content,
		templateType,
		browser,
		os,
		documentationLink,
		labelId,
	);
};

export const deleteQuestion = async (id, userId) => {
	const question = await repository.getQuestionByIdDB(id);
	if (!question) {
		throw new Error("Question not found");
	}
	if (question.user_id !== userId) {
		throw new Error("You are not authorised to delete");
	}
	return repository.deleteQuestionDB(id);
};

export const getAllLabels = async () => {
	return repository.getAllLabelsDB();
};

export const searchQuestionsByLabels = async (labelId = []) => {
	if (!Array.isArray(labelId)) throw new Error("labelIds must be an array");
	if (labelId.length === 0) throw new Error("At least one label ID required");

	return repository.searchQuestionsByLabelsDB(labelId);
};
