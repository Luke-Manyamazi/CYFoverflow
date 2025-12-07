import * as authRepository from "../auth/authRepository.js";
import emailService from "../emails/emailService.js"; // This imports the fixed file
import * as questionRepository from "../questions/questionRepository.js";
import logger from "../utils/logger.js";

import * as repository from "./answerRepository.js";

export const createAnswer = async (content, userId, questionId) => {
	if (!content) {
		throw new Error("Content is required");
	}

	try {
		logger.info("Creating answer", { userId, questionId });

		// 1. Get answerer details
		const answerer = await authRepository.findUserById(userId);
		if (!answerer) throw new Error("Answerer not found");
		const answererName = answerer.name || "A fellow learner";

		// 2. Get question details
		const question = await questionRepository.getQuestionByIdDB(questionId);
		if (!question) throw new Error("Question not found");

		// DEBUG: Verify we have the slug
		logger.info("Question for email:", {
			id: question.id,
			slug: question.slug,
			hasSlug: !!question.slug,
			title: question.title,
			authorEmail: question.author_email,
		});

		// 3. Create the answer
		const answer = await repository.createAnswerDB({
			content,
			user_id: userId,
			question_id: questionId,
		});

		logger.info("Answer created", { answerId: answer.id });

		// 4. Send email notification
		if (question.author_email && question.slug) {
			emailService
				.sendAnswerNotification({
					questionAuthorEmail: question.author_email,
					questionAuthorName: question.author_name,
					questionSlug: question.slug, // Pass the slug
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

// Add this function to answerService.js
export const getAnswersByUserId = async (userId) => {
	try {
		logger.info("Getting answers for user", { userId });

		// Use the repository function that includes question details
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
