import db from "../db.js";
import logger from "../utils/logger.js";

export async function findUserByEmail(email) {
	try {
		const result = await db.query("SELECT * FROM users WHERE email = $1", [
			email,
		]);
		return result.rows[0];
	} catch (error) {
		logger.error("Error finding user by email: %O", error);
		throw error;
	}
}

export async function createUser(name, email, hashedPassword) {
	try {
		const result = await db.query(
			"INSERT INTO users (name, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, name, email",
			[name, email, hashedPassword],
		);
		return result.rows[0];
	} catch (error) {
		logger.error("Error creating user: %O", error);
		throw error;
	}
}

export async function findUserById(id) {
	const result = await db.query(
		"SELECT id, name, email FROM users WHERE id = $1",
		[id],
	);
	return result.rows[0];
}
