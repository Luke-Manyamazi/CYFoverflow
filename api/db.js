import pg from "pg";

import config from "./utils/config.js";
import logger from "./utils/logger.js";

let pool;

/**
 * Initializes the database connection pool.
 */
export const connectDb = async () => {
	try {
		// Initialize the pool
		pool = new pg.Pool(config.dbConfig);

		pool.on("error", (err) => logger.error("Unexpected PG error", err));

		const res = await pool.query("SELECT 1");
		logger.info("Connected to PostgreSQL:", res.rows);

		return pool;
	} catch (err) {
		logger.error("Database connection failed:", err);
		throw err;
	}
};

/**
 * Helper function to run queries on the initialized pool.
 * @param {string} text - The query text.
 * @param {any[]} [params] - Optional query parameters.
 * @returns {Promise<pg.QueryResult>}
 */
export const query = (text, params) => {
	if (!pool) {
		throw new Error("Database pool not initialized. Call connectDb() first.");
	}
	return pool.query(text, params);
};
