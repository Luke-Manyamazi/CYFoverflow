/**
 * Finish the body-to-content migration.
 * The previous migration added content but didn't drop body.
 * This migration copies any remaining data from body to content and drops body.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function up(pgm) {
	// Check if body column exists in questions table
	const questionsColumns = await pgm.db.query(`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = 'questions'
		AND column_name = 'body'
	`);

	const hasBody = questionsColumns.rows.length > 0;

	if (hasBody) {
		// Copy data from body to content where content is NULL or empty
		await pgm.db.query(`
			UPDATE questions
			SET content = COALESCE(NULLIF(TRIM(content), ''), body)
			WHERE body IS NOT NULL
			AND (content IS NULL OR TRIM(content) = '')
		`);

		// Drop NOT NULL constraint on body before dropping it (if it exists)
		await pgm.db
			.query(
				`
			ALTER TABLE questions
			ALTER COLUMN body DROP NOT NULL;
		`,
			)
			.catch(() => {
				// Ignore if constraint doesn't exist
			});

		// Drop the body column
		pgm.dropColumn("questions", "body");
	}
}

/**
 * Undo the changes - add body column back (but we can't restore the data)
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function down(pgm) {
	// Add body column back (data will be lost)
	pgm.addColumn("questions", {
		body: { type: "text", notNull: false },
	});
}
