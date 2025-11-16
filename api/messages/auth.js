import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import db from "../db.js";
import config from "../utils/config.js";
import logger from "../utils/logger.js";

const SALT_ROUNDS = 10;
const JWT_SECRET =
	config.jwtSecret || "a_very_insecure_fallback_secret_for_development_only";

/**
 * Creates a new user in the database.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} The new user record (id, name, email).
 */
export async function registerUser(name, email, password) {
	// 1. Check if user already exists
	const existingUser = await db.query("SELECT id FROM users WHERE email = $1", [
		email,
	]);
	if (existingUser.rows.length > 0) {
		throw new Error("User already exists.");
	}

	// 2. Hash the password
	const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
	logger.debug(`Password for ${email} hashed successfully.`);

	// 3. Insert new user into the database
	const result = await db.query(
		"INSERT INTO users (name, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, name, email",
		[name, email, hashedPassword],
	);

	return result.rows[0];
}

/**
 * Authenticates a user and generates a JWT (Required for the full auth flow).
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: object}>} The JWT and public user data.
 */
export async function loginUser(email, password) {
	const userResult = await db.query(
		"SELECT id, name, email, hashed_password FROM users WHERE email = $1",
		[email],
	);
	const user = userResult.rows[0];

	if (!user) {
		throw new Error("Invalid credentials.");
	}

	const match = await bcrypt.compare(password, user.hashed_password);

	if (!match) {
		throw new Error("Invalid credentials.");
	}

	const tokenPayload = { userId: user.id, email: user.email };

	const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });

	const publicUser = { id: user.id, name: user.name, email: user.email };
	return { token, user: publicUser };
}
