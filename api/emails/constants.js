// api/emails/constants.js
export const EMAIL_SOURCE = "info@cyf.academy";
export const EMAIL_REGION = "eu-west-1"; // Hardcode your region
export const APP_URL =
	"https://g8s8wck4848csgk00040cgk0.hosting.codeyourfuture.io"; // Hardcode your domain

// Email subjects
export const SUBJECTS = {
	ANSWER_NOTIFICATION: (questionTitle) =>
		`🎯 New Answer to: "${questionTitle}"`,
	WELCOME: "👋 Welcome to CYFoverflow!",
	PASSWORD_RESET: "🔐 Reset Your CYFoverflow Password",
	// Add more subjects as needed
};
