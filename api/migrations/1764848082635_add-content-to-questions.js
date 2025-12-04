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
		// First, ensure body can be nullable temporarily for rename
		await pgm.db.query(`
			ALTER TABLE questions
			ALTER COLUMN body DROP NOT NULL;
		`);
		pgm.renameColumn("questions", "body", "content");
		// Restore NOT NULL constraint on content
		await pgm.db.query(`
			ALTER TABLE questions
			ALTER COLUMN content SET NOT NULL;
		`);
	} else if (hasBody && hasContent) {
		// Both exist - copy data from body to content, then drop body
		await pgm.db.query(`
			UPDATE questions
			SET content = COALESCE(content, body)
			WHERE body IS NOT NULL;
		`);
		pgm.dropColumn("questions", "body");
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
		// First, ensure body can be nullable temporarily for rename
		await pgm.db.query(`
			ALTER TABLE answers
			ALTER COLUMN body DROP NOT NULL;
		`);
		pgm.renameColumn("answers", "body", "content");
		// Restore NOT NULL constraint on content
		await pgm.db.query(`
			ALTER TABLE answers
			ALTER COLUMN content SET NOT NULL;
		`);
	} else if (answersHasBody && answersHasContent) {
		// Both exist - copy data from body to content, then drop body
		await pgm.db.query(`
			UPDATE answers
			SET content = COALESCE(content, body)
			WHERE body IS NOT NULL;
		`);
		pgm.dropColumn("answers", "body");
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
