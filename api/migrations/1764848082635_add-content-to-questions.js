/**
 * Add missing content columns to questions and answers tables.
 * This fixes the issue where tables were created without the content column
 * due to old migration versions running.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function up(pgm) {
	// Check and add content column to questions table
	const questionsContentExists = await pgm.db.query(`
		SELECT EXISTS (
			SELECT FROM information_schema.columns
			WHERE table_name = 'questions' AND column_name = 'content'
		);
	`);

	if (!questionsContentExists.rows[0].exists) {
		pgm.addColumn("questions", {
			content: { type: "text", notNull: true, default: "" },
		});
	}

	// Check and add content column to answers table
	const answersContentExists = await pgm.db.query(`
		SELECT EXISTS (
			SELECT FROM information_schema.columns
			WHERE table_name = 'answers' AND column_name = 'content'
		);
	`);

	if (!answersContentExists.rows[0].exists) {
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
