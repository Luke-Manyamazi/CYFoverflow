import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { runner } from "node-pg-migrate";

import { connectDb, disconnectDb } from "./db.js";
import config from "./utils/config.js";
import logger from "./utils/logger.js";

config.init({
	DATABASE_URL: "postgres://user:pass@localhost:5432/fake",
	PORT: "0",
	JWT_SECRET: "test-secret",
});

/** @type {import("@testcontainers/postgresql").StartedPostgreSqlContainer} */
let dbContainer;

const skipDb = config.get("SKIP_DB_TESTS") === "true";

beforeAll(async () => {
	if (skipDb) {
		logger.error("Skipping Postgres setup for this test run");
		return;
	}

	dbContainer = await new PostgreSqlContainer("postgres:17-alpine").start();
	const url = new URL(dbContainer.getConnectionUri());
	url.searchParams.set("sslmode", url.searchParams.get("sslmode") ?? "disable");

	config.init({ DATABASE_URL: url.toString(), PORT: "0" });

	await applyMigrations();
	await connectDb();
}, 60_000);

afterAll(async () => {
	if (!skipDb) {
		await disconnectDb();
		if (dbContainer) {
			await dbContainer.stop();
		}
	}
});

async function applyMigrations() {
	await runner({ ...config.migrationConfig, direction: "up" });
}
