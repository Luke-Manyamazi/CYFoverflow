import { getQuestionByIdDB } from "../questions/questionRepository.js";
import logger from "../utils/logger.js";
import { sendEmailToAuthor } from "../utils/sendEmailToAuthor.js";

import * as repository from "./answerRepository.js";

export const createAnswer = async (content, userId, questionId) => {
	if (!content) {
		throw new Error("Content is required");
	}

	// Create the answer
	const answer = await repository.createAnswerDB({
		content,
		user_id: userId,
		question_id: questionId,
	});

	// Send email notification to question author
	try {
		const question = await getQuestionByIdDB(questionId);
		if (question?.author_email) {
			logger.info("Sending email to %s", question.author_email);
			await sendEmailToAuthor(question.author_email, content, question.title);
			logger.info(`Email sent to ${question.author_email} about new answer.`);
		}
	} catch (err) {
		logger.error("Failed to send email to question author: %O", err);
	}

	// Return the created answer
	return answer;
};
export const getAnswersByQuestionId = async (questionId) => {
	const answers = await repository.getAnswerByQuestionIdDB(questionId);
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
