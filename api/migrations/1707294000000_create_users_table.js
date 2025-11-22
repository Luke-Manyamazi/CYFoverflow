/*
 * Migration file for creating the 'users' table.
 * This table stores user registration details, including the hashed password.
 */

// Use an arbitrary large number for 'mDate' to ensure it runs late in development,
// or replace with your current timestamp (e.g., 1707294000000)
// const mDate = '1707294000000';
/**
 * Runs the migration to create the 'users' table.
 * @param {import("node-pg-migrate").InjectedActions} pgm
 */
export async function up(pgm) {
	pgm.createTable("users", {
		id: {
			type: "SERIAL",
			primaryKey: true,
		},
		name: {
			type: "VARCHAR(255)",
			notNull: true,
		},
		email: {
			type: "VARCHAR(255)",
			notNull: true,
			unique: true, // Ensures no two users can register with the same email
		},
		hashed_password: {
			type: "VARCHAR(255)",
			notNull: true,
		},
		created_at: {
			type: "timestamp",
			notNull: true,
			default: pgm.func("NOW()"),
		},
	});
}

/**
 * Runs the migration to drop the 'users' table.
 * @param {import("node-pg-migrate").InjectedActions} pgm
 */
export async function down(pgm) {
	// Drop the table and its associated index
	pgm.dropTable("users");
}
