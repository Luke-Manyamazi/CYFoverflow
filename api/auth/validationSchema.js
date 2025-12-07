import Joi from "joi";

const hasUppercase = /(?=.*[A-Z])/;
const hasLowercase = /(?=.*[a-z])/;
const hasNumber = /(?=.*[0-9])/;
const hasSpecialChar = /(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?])/;
const validCharacters = /^[a-zA-Z0-9!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>/?]+$/;

const complexPassword = Joi.string()
	.min(8)
	.max(128)
	.pattern(hasUppercase, { name: "uppercase letter" })
	.pattern(hasLowercase, { name: "lowercase letter" })
	.pattern(hasNumber, { name: "number" })
	.pattern(hasSpecialChar, { name: "special character" })
	.pattern(validCharacters)
	.required()
	.messages({
		"string.min": "Password must be at least 8 characters long",
		"string.max": "Password must be no more than 128 characters",
		"string.pattern.name": "Password must contain at least one {#name}",
		"string.pattern.base": "Password contains invalid characters",
		"any.required": "Password is required",
	});

const signupSchema = Joi.object({
	name: Joi.string()
		.trim()
		.min(2)
		.max(50)
		.pattern(/^[a-zA-Z\s'-]+$/, {
			name: "letters, spaces, hyphens, and apostrophes",
		})
		.required()
		.messages({
			"string.min": "Name must be at least 2 characters long",
			"string.max": "Name must be no more than 50 characters",
			"string.pattern.name": "Name can only contain {#name}",
			"any.required": "Name is required",
		}),

	email: Joi.string()
		.email({
			minDomainSegments: 2,
			maxDomainSegments: 4,
			tlds: { allow: true },
		})
		.lowercase()
		.trim()
		.required()
		.messages({
			"string.email": "Please provide a valid email address",
			"any.required": "Email is required",
		}),

	password: complexPassword,
});

const loginSchema = Joi.object({
	email: Joi.string().email().lowercase().trim().required().messages({
		"string.email": "Please provide a valid email address",
		"any.required": "Email is required",
	}),

	password: Joi.string().min(6).required().messages({
		"string.min": "Password must be at least 6 characters long",
		"any.required": "Password is required",
	}),
});

export { signupSchema, loginSchema };
