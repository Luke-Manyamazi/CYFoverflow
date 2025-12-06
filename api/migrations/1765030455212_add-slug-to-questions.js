/**
 * Add slug column to questions table and generate slugs for existing questions.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function up(pgm) {
	await pgm.db.query("ALTER TABLE questions ADD COLUMN slug TEXT");

	const questions = await pgm.db.query("SELECT id, title FROM questions");
	const usedSlugs = new Set();

	for (const question of questions.rows) {
		let slug = question.title
			.toString()
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-")
			.replace(/[^\w-]+/g, "")
			.replace(/--+/g, "-")
			.replace(/^-+/, "")
			.replace(/-+$/, "");

		if (!slug) {
			slug = `question-${question.id}`;
		}

		let finalSlug = slug;
		let counter = 1;
		while (usedSlugs.has(finalSlug)) {
			finalSlug = `${slug}-${counter}`;
			counter++;
		}
		usedSlugs.add(finalSlug);

		await pgm.db.query("UPDATE questions SET slug = $1 WHERE id = $2", [
			finalSlug,
			question.id,
		]);
	}

	await pgm.db.query("ALTER TABLE questions ALTER COLUMN slug SET NOT NULL");
	await pgm.db.query(
		"CREATE UNIQUE INDEX questions_slug_idx ON questions(slug)",
	);
}

/**
 * Remove slug column from questions table.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function down(pgm) {
	pgm.dropIndex("questions", "slug");
	pgm.dropColumn("questions", "slug");
}

/** @type {Record<string, import("node-pg-migrate").ColumnDefinition>} */
export const shorthands = {};
