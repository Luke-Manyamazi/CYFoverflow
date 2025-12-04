/* eslint-disable no-console */
/**
 * One-time script to fix migration name mismatch in the database.
 * This fixes the issue where an old migration name exists in the database
 * but the file has been renamed.
 */

import pg from "pg";

import config from "../utils/config.js";

const { dbConfig } = config.init();
const client = new pg.Client(dbConfig);

try {
	await client.connect();
	console.log("Connected to database");

	// Check if migrations table exists
	const tableCheck = await client.query(`
		SELECT EXISTS (
			SELECT FROM information_schema.tables
			WHERE table_name = 'migrations'
		);
	`);

	if (!tableCheck.rows[0].exists) {
		console.log("Migrations table does not exist. Nothing to fix.");
		await client.end();
	} else {
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

		if (oldMigration.rows.length === 0) {
			console.log(
				"\nNo migration with name '1707922794590_welcome-message' found.",
			);
			console.log("Migration name is already correct or doesn't exist.");
			await client.end();
		} else {
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
			await client.end();
		}
	}
} catch (error) {
	console.error("Error fixing migration:", error);
	await client.end();
	throw error;
}
