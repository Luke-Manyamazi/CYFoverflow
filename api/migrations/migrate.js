import { parseArgs } from "node:util";

import { runner } from "node-pg-migrate";

import config from "../utils/config.js";

const {
	positionals: [direction, rawCount],
} = parseArgs({ allowPositionals: true });

if (!direction || !["down", "redo", "up"].includes(direction)) {
	throw new Error("usage: npm run migration <up|down|redo> [count]");
}

const { migrationConfig } = config.init();

// Add logging to see what migrations will run
const logger = (await import("../utils/logger.js")).default;
logger.info(
	`Running migrations: direction=${direction}, count=${rawCount || "all"}`,
);

const count = rawCount ? parseInt(rawCount, 10) : undefined;

if (direction === "redo") {
	await runner({ ...migrationConfig, count, direction: "down" });
	await runner({ ...migrationConfig, count: count ?? 1, direction: "up" });
} else {
	const result = await runner({ ...migrationConfig, count, direction });
	logger.info(`Migration ${direction} completed`, { result });
}
