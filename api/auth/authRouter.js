import { Router } from "express";

import { generateToken } from "../utils/auth.js";
import logger from "../utils/logger.js";

import * as authService from "./authService.js";

const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			return res
				.status(400)
				.json({ message: "All fields (name, email, password) are required." });
		}

		if (password.length < 6) {
			return res
				.status(400)
				.json({ message: "Password must be at least 6 characters long." });
		}

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

authRouter.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required." });
		}

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
