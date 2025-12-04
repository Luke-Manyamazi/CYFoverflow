/**
 * Utility script to fix migration issues or reset the database.
 *
 * Usage:
 *   node fix-migration-name.js           - Fix migration name mismatches
 *   node fix-migration-name.js --reset  - Drop all tables and recreate them
 */
/* eslint-disable no-console -- CLI script requires console output */

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
	if (migrationsTableExists) {
		// Check current migrations
		const currentMigrations = await client.query(
			"SELECT * FROM migrations ORDER BY run_on",
		);
		console.log("\nCurrent migrations in database:");
		currentMigrations.rows.forEach((m) => {
			console.log(`  - ${m.name} (run on: ${m.run_on})`);
		});

		// Check if the problematic migration exists
		const oldMigration = await client.query(
			"SELECT * FROM migrations WHERE name = $1",
			["1707922794590_welcome-message"],
		);

		if (oldMigration.rows.length > 0) {
			// Check if new migration name already exists
			const newMigration = await client.query(
				"SELECT * FROM migrations WHERE name = $1",
				["1707000000001_welcome-message"],
			);

			if (newMigration.rows.length > 0) {
				console.log(
					"\nMigration '1707000000001_welcome-message' already exists.",
				);
				console.log("Removing old migration record...");
				await client.query("DELETE FROM migrations WHERE name = $1", [
					"1707922794590_welcome-message",
				]);
				console.log("✓ Old migration record removed");
			} else {
				// Update the migration name
				console.log("\nUpdating migration name...");
				const result = await client.query(
					"UPDATE migrations SET name = $1 WHERE name = $2",
					["1707000000001_welcome-message", "1707922794590_welcome-message"],
				);
				console.log(`✓ Updated ${result.rowCount} migration record(s)`);
			}

			// Verify the fix
			const verify = await client.query(
				"SELECT * FROM migrations ORDER BY run_on",
			);
			console.log("\nUpdated migrations:");
			verify.rows.forEach((m) => {
				console.log(`  - ${m.name} (run on: ${m.run_on})`);
			});

			console.log("\n✓ Migration name fixed successfully!");
		} else {
			console.log(
				"\nNo migration with name '1707922794590_welcome-message' found.",
			);
			console.log("Migration name is already correct or doesn't exist.");
		}
	} else {
		console.log("Migrations table does not exist. Nothing to fix.");
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
