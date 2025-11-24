import { Router } from "express";

import { generateToken } from "../utils/auth.js";
import logger from "../utils/logger.js";
import validate from "../utils/validation.js";

import * as authService from "./authService.js";
import { signupSchema, loginSchema } from "./validationSchema.js";

const authRouter = Router();

// --- SIGN-UP Route ---
// Using the validate middleware with signupSchema
authRouter.post("/signup", validate(signupSchema), async (req, res) => {
	try {
		// Joi has ensured name, email, and password meet all requirements.
		const { name, email, password } = req.body;

		const newUser = await authService.signUp(name, email, password);
		const token = generateToken(newUser.id);

		res.status(201).json({
			newUser,
			token,
		});
	} catch (error) {
		logger.error("Signup failed: %O", error);
		const statusCode = error.message?.includes("already exists") ? 409 : 500;
		res.status(statusCode).json({
			message: error.message || "Internal server error.",
		});
	}
});

// --- LOGIN Route ---
// Using the validate middleware with loginSchema
authRouter.post("/login", validate(loginSchema), async (req, res) => {
	try {
		// Joi has ensured email and password are present and meet min length.
		const { email, password } = req.body;

		const user = await authService.login(email, password);
		const token = generateToken(user.id);

		res.status(200).json({
			user,
			token,
		});
	} catch (error) {
		logger.error("Login failed: %O", error);
		const statusCode = error.message?.includes("Invalid credentials")
			? 401
			: 500;
		res.status(statusCode).json({
			message: error.message || "Internal server error.",
		});
	}
});

export default authRouter;
