// api/emails/emailService.js
import AWS from "aws-sdk";

import logger from "../utils/logger.js";

import { EMAIL_SOURCE, EMAIL_REGION, SUBJECTS } from "./constants.js";
import {
	getAnswerNotificationHtml,
	getAnswerNotificationText,
} from "./templates/index.js";
import { truncateContent, getQuestionUrl } from "./templates/templateUtils.js";

// Configure AWS SES - Hardcode the region
AWS.config.update({
	region: EMAIL_REGION, // This is now hardcoded to 'eu-west-1'
	// No credentials needed - will automatically use EC2 instance IAM role
});

const ses = new AWS.SES({ apiVersion: "2010-12-01" });

class EmailService {
	async sendAnswerNotification({
		questionAuthorEmail,
		questionAuthorName,
		questionId,
		questionSlug,
		questionTitle,
		answererName,
		answerContent,
		appUrl, // This can still be passed optionally
	}) {
		try {
			if (!questionAuthorEmail) {
				logger.warn("EmailService: Question author email is required");
				return {
					success: false,
					error: "Question author email is required",
				};
			}

			// Use provided appUrl or default from constants
			const finalAppUrl = appUrl || EMAIL_SOURCE.replace("info@", "https://");
			const questionIdentifier = questionSlug || questionId;
			const questionUrl = getQuestionUrl(questionIdentifier, finalAppUrl);
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
