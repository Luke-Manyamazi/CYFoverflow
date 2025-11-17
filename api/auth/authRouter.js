// api/auth/authRouter.js

import { Router } from "express";

import { connectDb } from "../db.js";
import logger from "../utils/logger.js";

const authRouter = Router();

// --- POST /signup route ---
// Expected URL: POST /api/signup
authRouter.post("/signup", async (req, res, next) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res
			.status(400)
			.json({ message: "All fields (name, email, password) are required." });
	}

	try {
		const pool = await connectDb();

		logger.info(`Attempting to sign up user: ${email}`);

		// Placeholder for actual database insertion logic
		// This query is for demonstration and should be replaced with secured logic
		const result = await pool.query(
			"INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
			[name, email, password], // Passwords should be hashed!
		);

		res.status(201).json({
			message: "User registered successfully.",
			userId: result.rows[0].id,
		});
	} catch (error) {
		// Handle common errors like duplicate email constraint violation
		if (error.code === "23505") {
			// PostgreSQL unique violation error code
			return res
				.status(409)
				.json({ message: "This email address is already registered." });
		}
		logger.error("Signup failed:", error);
		next(error); // Pass error to Express error handler
	}
});

// --- POST /login route ---
// Expected URL: POST /api/login
authRouter.post("/login", async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.json({ message: "Email and password are required." });
	}

	try {
		const pool = await connectDb();

		// ⚠️ WARNING: In a real app, retrieve the password HASH and compare it.
		// This is a placeholder for fetching user credentials.
		const result = await pool.query(
			"SELECT id, password_hash FROM users WHERE email = $1",
			[email],
		);

		const user = result.rows[0];

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials." });
		}

		// Placeholder for password comparison
		// if (await bcrypt.compare(password, user.password_hash)) { ... }
		if (password === user.password_hash) {
			// 🚫 DANGER: Use bcrypt in production
			logger.info(`User logged in: ${email}`);

			// 🔒 Generate and return a JWT token here for state management
			res.json({
				message: "Login successful.",
				token: "FAKE_JWT_TOKEN_FOR_NOW",
				userId: user.id,
			});
		} else {
			res.status(401).json({ message: "Invalid credentials." });
		}
	} catch (error) {
		logger.error("Login failed:", error);
		next(error);
	}
});

export default authRouter;
