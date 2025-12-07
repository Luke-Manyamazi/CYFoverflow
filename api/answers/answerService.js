import emailService from "../emails/emailService.js";
import * as questionRepository from "../questions/questionRepository.js";
import logger from "../utils/logger.js";

import * as repository from "./answerRepository.js";

export const createAnswer = async (
	content,
	userId,
	questionId,
	answererName,
) => {
	if (!content) {
		throw new Error("Content is required");
	}

	try {
		logger.info("Creating answer", {
			userId,
			questionId,
			answererName: answererName || "unknown",
		});

		// Get question details to find author email
		const question = await questionRepository.getQuestionByIdDB(questionId);

		if (!question) {
			throw new Error("Question not found");
		}

		// Create the answer
		const answer = await repository.createAnswerDB({
			content,
			user_id: userId,
			question_id: questionId,
		});

		logger.info("Answer created successfully", {
			answerId: answer.id,
			questionId,
			userId,
			answererName,
		});

		// Send email notification asynchronously
		if (question.author_email) {
			const finalAnswererName = answererName || "A fellow learner";

			emailService
				.sendAnswerNotification({
					questionAuthorEmail: question.author_email,
					questionAuthorName: question.author_name || question.author_username,
					questionId: question.id,
					questionTitle: question.title,
					answererName: finalAnswererName,
					answerContent: content,
				})
				.then((result) => {
					if (result.success) {
						logger.info("Answer notification email sent", {
							answerId: answer.id,
							to: question.author_email,
							messageId: result.messageId,
							answererName: finalAnswererName,
						});
					} else {
						logger.warn("Failed to send answer notification email", {
							answerId: answer.id,
							error: result.error,
							answererName: finalAnswererName,
						});
					}
				})
				.catch((error) => {
					logger.error("Error sending email notification", {
						answerId: answer.id,
						error: error.message,
						answererName: finalAnswererName,
					});
				});
		} else {
			logger.warn(
				"Cannot send email notification - question author email not found",
				{
					questionId,
					answerId: answer.id,
					answererName,
				},
			);
		}

		return answer;
	} catch (error) {
		logger.error("Error creating answer", {
			error: error.message,
			userId,
			questionId,
			answererName: answererName || "unknown",
		});
		throw error;
	}
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
