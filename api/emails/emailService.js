import AWS from "aws-sdk";

import logger from "../utils/logger.js";

import { EMAIL_SOURCE, EMAIL_REGION, SUBJECTS, APP_URL } from "./constants.js";
import {
	getAnswerNotificationHtml,
	getAnswerNotificationText,
} from "./templates/index.js";
import { truncateContent } from "./templates/templateUtils.js";

// Configure AWS SES
AWS.config.update({
	region: EMAIL_REGION,
	// No credentials needed - will automatically use EC2 instance IAM role
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

class EmailService {
	async sendAnswerNotification({
		questionAuthorEmail,
		questionAuthorName,
		questionSlug,
		questionId,
		questionTitle,
		answererName,
		answerContent,
		appUrl = APP_URL,
	}) {
		try {
			if (!questionAuthorEmail) {
				logger.warn("EmailService: Question author email is required");
				return {
					success: false,
					error: "Question author email is required",
				};
			}

			// CRITICAL: Build the URL with the slug
			const questionUrl = `${appUrl}/questions/${questionSlug}`;

			// Log the URL for debugging
			logger.info("Building email URL:", {
				appUrl,
				questionSlug,
				questionUrl,
				questionId,
				hasSlug: !!questionSlug,
			});
			const truncatedAnswer = truncateContent(answerContent, 300);

			const params = {
				Source: EMAIL_SOURCE,
				Destination: {
					ToAddresses: [questionAuthorEmail],
				},
				Message: {
					Subject: {
						Data: SUBJECTS.ANSWER_NOTIFICATION(questionTitle),
						Charset: "UTF-8",
					},
					Body: {
						Html: {
							Data: getAnswerNotificationHtml({
								questionAuthorName,
								questionTitle,
								answererName,
								answerContent: truncatedAnswer,
								questionUrl,
							}),
							Charset: "UTF-8",
						},
						Text: {
							Data: getAnswerNotificationText({
								questionTitle,
								answererName,
								answerContent: truncatedAnswer,
								questionUrl,
							}),
							Charset: "UTF-8",
						},
					},
				},
			};

			const result = await ses.sendEmail(params).promise();

			logger.info("EmailService: Answer notification sent successfully", {
				to: questionAuthorEmail,
				questionId,
				questionSlug,
				questionUrl,
				messageId: result.MessageId,
			});

			return {
				success: true,
				messageId: result.MessageId,
			};
		} catch (error) {
			logger.error("EmailService: Failed to send answer notification", {
				error: error.message,
				errorCode: error.code,
				questionId,
				questionSlug,
				to: questionAuthorEmail,
			});

			return {
				success: false,
				error: error.message,
				code: error.code,
			};
		}
	}
}

export default new EmailService();
