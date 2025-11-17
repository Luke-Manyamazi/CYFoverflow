import pg from "pg";

import config from "./utils/config.js";
import logger from "./utils/logger.js";

let pool;

export const connectDb = async () => {
	try {
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

export default pool;
