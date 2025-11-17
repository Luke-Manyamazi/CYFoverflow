import { query } from "../db.js";
import logger from "../utils/logger.js";

/**
 * Retrieves all messages from the database.
 * @returns {Promise<object[]>} An array of message rows.
 */
export async function getAll() {
	try {
		const { rows } = await query("SELECT * FROM message;");
		return rows;
	} catch (error) {
		logger.error("Error retrieving all messages: %O", error);
		throw error;
	}
}
