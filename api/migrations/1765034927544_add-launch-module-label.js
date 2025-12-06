/**
 * Add Launch-Module label to the labels table.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function up(pgm) {
	await pgm.db.query(`
		INSERT INTO labels (name) 
		VALUES ('Launch-Module')
		ON CONFLICT (name) DO NOTHING;
	`);
}

/**
 * Remove Launch-Module label.
 *
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 * @returns {void | Promise<void>}
 */
export async function down(pgm) {
	await pgm.db.query(`
		DELETE FROM labels 
		WHERE name = 'Launch-Module';
	`);
}
