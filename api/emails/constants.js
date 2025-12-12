// api/emails/constants.js
export const EMAIL_SOURCE = "info@cyf.academy";
export const EMAIL_REGION = "eu-west-1"; // Hardcode your region
export const APP_URL = "https://cyfoverflow.hosting.codeyourfuture.io/";

// Email subjects
export const SUBJECTS = {
	ANSWER_NOTIFICATION: (questionTitle) => `New Answer to: "${questionTitle}"`,
	WELCOME: "Welcome to CYFoverflow!",
	PASSWORD_RESET: "Reset Your CYFoverflow Password",
	// We will add more subjects as needed
};
