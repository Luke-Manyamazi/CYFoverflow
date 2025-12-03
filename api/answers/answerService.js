import logger from "../utils/logger.js";

import * as repository from "./answerRepository.js";

export const createAnswer = (content, userId, questionId) => {
	if (!content) {
		throw new Error("Content is required");
	}
	return repository.createAnswerDB(content, userId, questionId);
};

export const getAnswersByQuestionId = async (questionId) => {
	const answers = await repository.getAnswersByQuestionIdDB(questionId);
	if (!answers) {
		logger.error("Error not found Question" + questionId);
	}
	return answers;
};

export const updateAnswer = async (id, content, userId) => {
	if (!content) throw new Error("Content cannot be empty");

	const answer = await repository.getAnswerByIdDB(id);

	if (!answer) {
		throw new Error("Answer not found");
	}

	if (answer.user_id !== userId) {
		throw new Error("Unauthorized: You can only edit your own answer");
	}

	return repository.updateAnswerDB(id, content);
};

export const deleteAnswer = async (id, userId) => {
	const answer = await repository.getAnswerByIdDB(id);

	if (!answer) {
		throw new Error("Answer not found");
	}

	if (answer.user_id !== userId) {
		throw new Error("Unauthorized: You can only delete your own answer");
	}

	return repository.deleteAnswerDB(id);
};
