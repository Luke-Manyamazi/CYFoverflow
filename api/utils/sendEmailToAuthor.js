import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

import config from "./config.js";

// SES client using IAM role (no credentials needed)
const sesClient = new SESClient({
	region: config.AWS_REGION || "eu-west-1",
});

export const sendEmailToAuthor = async (
	authorEmail,
	answerContent,
	questionTitle,
) => {
	const params = {
		Source: "info@cyf.academy",
		Destination: { ToAddresses: [authorEmail] },
		Message: {
			Subject: {
				Data: `New answer to your question: "${questionTitle}"`,
				Charset: "UTF-8",
			},
			Body: {
				Html: {
					Data: `
            <html>
              <body>
                <h1>Your question has a new answer!</h1>
                <p><strong>Question:</strong> ${questionTitle}</p>
                <p><strong>Answer:</strong> ${answerContent}</p>
                <p>Sent at: ${new Date().toLocaleString()}</p>
              </body>
            </html>
          `,
					Charset: "UTF-8",
				},
				Text: {
					Data: `Your question has a new answer!\n\nQuestion: ${questionTitle}\nAnswer: ${answerContent}\nSent at: ${new Date().toLocaleString()}`,
					Charset: "UTF-8",
				},
			},
		},
	};

	return await sesClient.send(new SendEmailCommand(params));
};
