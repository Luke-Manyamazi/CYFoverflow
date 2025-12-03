/* eslint-disable no-console */
import { parseArgs } from "node:util";

import { runner } from "node-pg-migrate";
import pg from "pg";

import config from "../utils/config.js";
import logger from "../utils/logger.js";

const {
	positionals: [direction, rawCount],
} = parseArgs({ allowPositionals: true });

if (!direction || !["down", "redo", "up"].includes(direction)) {
	throw new Error("usage: npm run migration <up|down|redo> [count]");
}

const { migrationConfig } = config.init();

// Wait for database to be ready (with retries)
const waitForDatabase = async (maxRetries = 10, delayMs = 2000) => {
	const dbConfig = migrationConfig.databaseUrl;

	for (let i = 0; i < maxRetries; i++) {
		try {
			const client = new pg.Client(dbConfig);
			await client.connect();
			await client.query("SELECT 1");
			await client.end();
			console.log("Database connection successful");
			logger.info("Database connection successful");
			return;
		} catch (error) {
			if (i === maxRetries - 1) {
				logger.error(
					"Failed to connect to database after %d attempts",
					maxRetries,
				);
				throw error;
			}
			console.log(
				`Database not ready, retrying in ${delayMs}ms... (attempt ${i + 1}/${maxRetries})`,
			);
			logger.info(
				"Database not ready, retrying in %dms... (attempt %d/%d)",
				delayMs,
				i + 1,
				maxRetries,
			);
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}
};

console.log("Waiting for database...");
await waitForDatabase();
console.log("Database ready, starting migrations...");

const count = rawCount ? parseInt(rawCount, 10) : undefined;

try {
	console.log("Running migrations...");
	logger.info("Starting migrations...");
	if (direction === "redo") {
		await runner({ ...migrationConfig, count, direction: "down" });
		await runner({ ...migrationConfig, count: count ?? 1, direction: "up" });
	} else {
		await runner({ ...migrationConfig, count, direction });
	}
	console.log("Migrations completed successfully");
	logger.info("Migrations completed successfully");
} catch (error) {
	console.error("Migration failed:", error);
	logger.error("Migration failed: %O", error);
	throw error;
}
