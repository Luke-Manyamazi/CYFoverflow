/**
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
export async function up(pgm) {
	pgm.createTable("answers", {
		id: { type: "serial", primaryKey: true },
		content: { type: "text", notNull: true },
		user_id: {
			type: "integer",
			notNull: true,
			references: "users(id)",
			onDelete: "CASCADE",
		},
		question_id: {
			type: "integer",
			notNull: true,
			references: "questions(id)",
			onDelete: "CASCADE",
		},
		created_at: {
			type: "timestamp",
			notNull: true,
			default: pgm.func("NOW()"),
		},
		updated_at: {
			type: "timestamp",
			notNull: true,
			default: pgm.func("NOW()"),
		},
	});
}
/**
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */

export async function down(pgm) {
	pgm.dropTable("answers");
}
