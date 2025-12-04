/**
 * Add missing content columns to questions and answers tables.
 * This fixes the issue where tables were created without the content column
 * due to old migration versions running.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function up(pgm) {
	// Check questions table columns
	const questionsColumns = await pgm.db.query(`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = 'questions'
		AND column_name IN ('content', 'body');
	`);

	const hasContent = questionsColumns.rows.some(
		(r) => r.column_name === "content",
	);
	const hasBody = questionsColumns.rows.some((r) => r.column_name === "body");

	if (hasBody && !hasContent) {
		// Rename body to content
		pgm.renameColumn("questions", "body", "content");
	} else if (!hasContent && !hasBody) {
		// Add content column if neither exists
		pgm.addColumn("questions", {
			content: { type: "text", notNull: true, default: "" },
		});
	}

	// Check answers table columns
	const answersColumns = await pgm.db.query(`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = 'answers'
		AND column_name IN ('content', 'body');
	`);

	const answersHasContent = answersColumns.rows.some(
		(r) => r.column_name === "content",
	);
	const answersHasBody = answersColumns.rows.some(
		(r) => r.column_name === "body",
	);

	if (answersHasBody && !answersHasContent) {
		// Rename body to content
		pgm.renameColumn("answers", "body", "content");
	} else if (!answersHasContent && !answersHasBody) {
		// Add content column if neither exists
		pgm.addColumn("answers", {
			content: { type: "text", notNull: true, default: "" },
		});
	}
}

/**
 * Undo the changes introduced by the `up` function.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function down(pgm) {
	pgm.dropColumn("questions", "content");
	pgm.dropColumn("answers", "content");
}
