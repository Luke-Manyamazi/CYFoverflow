// api/auth/schemas.js
import Joi from "joi";

// Regular expressions for the password requirements
const hasUppercase = /(?=.*[A-Z])/; // Must contain at least one uppercase letter (A-Z)
const hasAlphanumeric = /(?=.*[a-z0-9])/; // Must contain at least one lowercase letter OR number
const hasSpecialChar = /(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?])/; // Must contain at least one special character
const validCharacters = /^[a-zA-Z0-9!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?]+$/; // Ensures NO illegal characters

const complexPassword = Joi.string()
	.min(6) // Minimum length of 6 characters
	.pattern(hasUppercase, { name: "uppercase" })
	.pattern(hasAlphanumeric, { name: "alphanumeric" })
	.pattern(hasSpecialChar, { name: "special character" })
	.pattern(validCharacters) // Enforce only allowed characters
	.required();

const signupSchema = Joi.object({
	name: Joi.string().trim().min(2).max(50).required(),

	// Email validation with domain segments
	email: Joi.string()
		.email({
			minDomainSegments: 2,
			maxDomainSegments: 4,
			tlds: { allow: true },
		})
		.required(),

	// Applying the complex password validation for SIGNUP
	password: complexPassword,
});

const loginSchema = Joi.object({
	email: Joi.string().email().required(),

	// For LOGIN, enforcing the minimum length
	password: Joi.string().min(6).required(),
});

export { signupSchema, loginSchema };
