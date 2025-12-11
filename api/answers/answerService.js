import * as authRepository from "../auth/authRepository.js";
import emailService from "../emails/emailService.js";
import * as notificationService from "../notifications/notificationService.js";
import * as questionRepository from "../questions/questionRepository.js";
import logger from "../utils/logger.js";

import * as repository from "./answerRepository.js";

export const createAnswer = async (content, userId, questionId) => {
	if (!content) {
		throw new Error("Content is required");
	}

	try {
		logger.info("Creating answer", { userId, questionId });

		const answerer = await authRepository.findUserById(userId);
		if (!answerer) throw new Error("Answerer not found");
		const answererName = answerer.name || "A fellow learner";

		const question = await questionRepository.getQuestionByIdDB(questionId);
		if (!question) throw new Error("Question not found");

		logger.info("Question for email:", {
			id: question.id,
			slug: question.slug,
			hasSlug: !!question.slug,
			title: question.title,
			authorEmail: question.author_email,
		});

		const answer = await repository.createAnswerDB({
			content,
			user_id: userId,
			question_id: questionId,
		});

		logger.info("Answer created", { answerId: answer.id });

		if (question.user_id && question.user_id !== userId) {
			notificationService
				.createNotification({
					userId: question.user_id,
					type: "answer",
					message: `${answererName} answered your question: "${question.title}"`,
					relatedQuestionId: question.id,
					relatedAnswerId: answer.id,
				})
				.then(() => {
					logger.info("Notification created successfully", {
						answerId: answer.id,
						questionAuthorId: question.user_id,
					});
				})
				.catch((error) => {
					logger.error("Notification creation failed", {
						answerId: answer.id,
						error: error.message,
					});
				});
		}

		if (question.author_email && question.slug) {
			emailService
				.sendAnswerNotification({
					questionAuthorEmail: question.author_email,
					questionAuthorName: question.author_name,
					questionSlug: question.slug,
					questionId: question.id,
					questionTitle: question.title,
					answererName: answererName,
					answerContent: content,
				})
				.then((result) => {
					if (result.success) {
						logger.info("Email sent successfully", {
							answerId: answer.id,
							messageId: result.messageId,
						});
					} else {
						logger.warn("Email service returned error", {
							answerId: answer.id,
							error: result.error,
						});
					}
				})
				.catch((error) => {
					logger.error("Email sending failed", {
						answerId: answer.id,
						error: error.message,
					});
				});
		} else {
			logger.warn("Cannot send email - missing data", {
				hasEmail: !!question.author_email,
				hasSlug: !!question.slug,
			});
		}

		return answer;
	} catch (error) {
		logger.error("Error creating answer", { error: error.message });
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

	const updatedAnswer = await repository.updateAnswerDB(id, content);

	try {
		const question = await questionRepository.getQuestionByIdDB(
			answer.question_id,
		);
		if (question && question.user_id && question.user_id !== userId) {
			const answerer = await authRepository.findUserById(userId);
			const answererName = answerer?.name || "A fellow learner";

			notificationService
				.createNotification({
					userId: question.user_id,
					type: "answer_updated",
					message: `${answererName} updated their answer to your question: "${question.title}"`,
					relatedQuestionId: question.id,
					relatedAnswerId: answer.id,
				})
				.catch((error) => {
					logger.error("Failed to create notification for answer update", {
						answerId: answer.id,
						questionAuthorId: question.user_id,
						error: error.message,
					});
				});
		}
	} catch (error) {
		logger.error("Error creating notification for answer update", {
			answerId: answer.id,
			error: error.message,
		});
	}

	return updatedAnswer;
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

export const getAnswersByUserId = async (userId) => {
	try {
		logger.info("Getting answers for user", { userId });

		const answers = await repository.getAnswersByUserIdWithQuestionsDB(userId);

		logger.info("Found answers for user", {
			userId,
			count: answers.length,
		});

		return answers;
	} catch (error) {
		logger.error("Error getting answers by user", {
			userId,
			error: error.message,
		});
		throw error;
	}
};
