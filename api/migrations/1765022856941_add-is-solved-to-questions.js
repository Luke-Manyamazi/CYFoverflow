/**
 * Add is_solved column to questions table if it doesn't exist.
 * This migration is idempotent and safe to run multiple times.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function up(pgm) {
	// Check if is_solved column already exists
	const columnExists = await pgm.db.query(`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.columns
			WHERE table_name = 'questions' AND column_name = 'is_solved'
		);
	`);

	if (!columnExists.rows[0].exists) {
		// Add the is_solved column
		pgm.addColumn("questions", {
			is_solved: {
				type: "boolean",
				notNull: true,
				default: false,
			},
		});
	}
}

/**
 * Remove the is_solved column from questions table.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function down(pgm) {
	// Check if is_solved column exists before dropping
	const columnExists = await pgm.db.query(`
		SELECT EXISTS (
			SELECT 1
			FROM information_schema.columns
			WHERE table_name = 'questions' AND column_name = 'is_solved'
		);
	`);

	if (columnExists.rows[0].exists) {
		pgm.dropColumn("questions", "is_solved");
	}
}
