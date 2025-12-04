/**
 * Utility script to fix migration issues or reset the database.
 *
 * Usage:
 *   node fix-migration-name.js           - Fix migration name mismatches
 *   node fix-migration-name.js --reset  - Drop all tables and recreate them
 */
/* eslint-disable no-console -- CLI script requires console output */

import { readdir } from "node:fs/promises";
import { parseArgs } from "node:util";

import { runner } from "node-pg-migrate";
import pg from "pg";

import config from "../utils/config.js";

const {
	values: { reset },
} = parseArgs({
	options: {
		reset: { type: "boolean", short: "r" },
	},
});

const { dbConfig, migrationConfig } = config.init();

async function dropAllTables(client) {
	console.log("\n⚠️  WARNING: Dropping all tables and resetting database...");

	// Get all table names
	const tablesResult = await client.query(`
		SELECT tablename
		FROM pg_tables
		WHERE schemaname = 'public'
	`);

	const tableNames = tablesResult.rows.map((row) => row.tablename);

	if (tableNames.length === 0) {
		console.log("No tables to drop.");
		return;
	}

	console.log(`\nFound ${tableNames.length} table(s) to drop:`);
	tableNames.forEach((name) => console.log(`  - ${name}`));

	// Drop all tables (CASCADE to handle foreign keys)
	for (const tableName of tableNames) {
		await client.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
		console.log(`✓ Dropped table: ${tableName}`);
	}

	console.log("\n✓ All tables dropped successfully!");
}

async function fixMigrationNames(client) {
	// Check if migrations table exists
	const tableCheck = await client.query(`
		SELECT EXISTS (
			SELECT FROM information_schema.tables
			WHERE table_name = 'migrations'
		);
	`);

	const migrationsTableExists = tableCheck.rows[0].exists;
	if (!migrationsTableExists) {
		console.log("Migrations table does not exist. Nothing to fix.");
		return;
	}

	// Get all migration files from disk
	const migrationsDir = migrationConfig.dir;
	const files = await readdir(migrationsDir);
	const migrationFiles = files
		.filter((f) => /^\d+_.+\.js$/.test(f))
		.map((f) => f.replace(/\.js$/, ""))
		.sort();

	console.log("\nMigration files on disk:");
	migrationFiles.forEach((f) => console.log(`  - ${f}`));

	// Get all migrations from database
	const dbMigrations = await client.query(
		"SELECT * FROM migrations ORDER BY run_on",
	);
	console.log("\nMigrations in database:");
	dbMigrations.rows.forEach((m) => {
		console.log(`  - ${m.name} (run on: ${m.run_on})`);
	});

	// Extract name pattern (everything after timestamp) from migration files
	const filePatterns = new Map();
	for (const fileName of migrationFiles) {
		const match = fileName.match(/^\d+_(.+)$/);
		if (match) {
			const pattern = match[1];
			filePatterns.set(pattern, fileName);
		}
	}

	// Find mismatches: database has migration with same pattern but different timestamp
	let fixedCount = 0;
	for (const dbMigration of dbMigrations.rows) {
		const match = dbMigration.name.match(/^\d+_(.+)$/);
		if (!match) continue;

		const pattern = match[1];
		const correctFileName = filePatterns.get(pattern);

		// If file exists with same pattern but different name, fix it
		if (correctFileName && correctFileName !== dbMigration.name) {
			console.log(
				`\n⚠️  Found mismatch: ${dbMigration.name} → ${correctFileName}`,
			);

			// Check if correct name already exists
			const existing = await client.query(
				"SELECT * FROM migrations WHERE name = $1",
				[correctFileName],
			);

			if (existing.rows.length > 0) {
				console.log(`  Removing duplicate: ${dbMigration.name}`);
				await client.query("DELETE FROM migrations WHERE name = $1", [
					dbMigration.name,
				]);
			} else {
				console.log(`  Updating: ${dbMigration.name} → ${correctFileName}`);
				await client.query("UPDATE migrations SET name = $1 WHERE name = $2", [
					correctFileName,
					dbMigration.name,
				]);
			}
			fixedCount++;
		}
	}

	if (fixedCount > 0) {
		console.log(`\n✓ Fixed ${fixedCount} migration name(s)`);

		// Show updated list
		const verify = await client.query(
			"SELECT * FROM migrations ORDER BY run_on",
		);
		console.log("\nUpdated migrations:");
		verify.rows.forEach((m) => {
			console.log(`  - ${m.name} (run on: ${m.run_on})`);
		});
	} else {
		console.log("\n✓ No migration name mismatches found.");
	}
}

const client = new pg.Client(dbConfig);

try {
	await client.connect();
	console.log("Connected to database");

	// If --reset flag is provided, drop all tables and re-run migrations
	if (reset) {
		await dropAllTables(client);
		await client.end();

		console.log("\n🔄 Running all migrations from scratch...");
		await runner({ ...migrationConfig, direction: "up" });
		console.log("\n✅ Database reset complete! All tables recreated.");
	} else {
		await fixMigrationNames(client);
		await client.end();
	}
} catch (error) {
	console.error("Error:", error);
	await client.end();
	throw error;
}
