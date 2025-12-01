import logger from "../utils/logger.js";

import * as repository from "./questionRepository.js";

export const createQuestion = async (
	userId,
	title,
	body,
	templateType,
	browser = null,
	os = null,
	documentationLink = null,
) => {
	if (!title) {
		throw new Error("Title is required");
	}
	if (!body) {
		throw new Error("Content is required");
	}

	return repository.createQuestionDB(
		title.trim(),
		body.trim(),
		templateType,
		userId,
		browser,
		os,
		documentationLink,
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
	body,
	templateType,
	browser = null,
	os = null,
	documentationLink = null,
) => {
	const updated = await repository.getQuestionByIdDB(id);
	if (!updated) {
		throw new Error("Question not found");
	}
	if (!title) {
		throw new Error("title is required");
	}
	if (!body) {
		throw new Error("body is required");
	}
	if (updated.user_id !== userId) {
		throw new Error("You are not authorised to edit");
	}
	return repository.updateQuestionDB(
		id,
		title,
		body,
		templateType,
		browser,
		os,
		documentationLink,
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
