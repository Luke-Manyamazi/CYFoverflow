import logger from "../utils/logger.js";

import * as repository from "./answerRepository.js";

// Create new answer
export const createAnswer = (content, userId, questionId) => {
	if (!content) throw new Error("Content is required");
	return repository.createAnswerDB({
		content,
		user_id: userId,
		question_id: questionId,
	});
};

// Get answers by question ID
export const getAnswersByQuestionId = async (questionId) => {
	const answers = await repository.getAnswerByQuestionIdDB(questionId);
	if (!answers) logger.error("Answers not found for question: " + questionId);
	return answers;
};

// Update answer
export const updateAnswer = async (id, content, userId) => {
	if (!content) throw new Error("Content cannot be empty");

	const answer = await repository.getAnswerByIdDB(id);
	if (!answer) throw new Error("Answer not found");
	if (answer.user_id !== userId) throw new Error("Unauthorized");

	return repository.updateAnswerDB(id, content);
};

// Delete answer
export const deleteAnswer = async (id, userId) => {
	const answer = await repository.getAnswerByIdDB(id);
	if (!answer) throw new Error("Answer not found");
	if (answer.user_id !== userId) throw new Error("Unauthorized");

	return repository.deleteAnswerDB(id);
};

// Get all answers by a user
export const getAnswersByUserId = async (userId) => {
	if (!userId) throw new Error("User ID is required");
	return await repository.getAnswersByUserIdDB(userId);
};
