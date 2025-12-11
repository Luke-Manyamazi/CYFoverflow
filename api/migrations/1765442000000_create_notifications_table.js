/**
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
export async function up(pgm) {
	pgm.createTable("notifications", {
		id: { type: "serial", primaryKey: true },
		user_id: {
			type: "integer",
			notNull: true,
			references: "users(id)",
			onDelete: "CASCADE",
		},
		type: {
			type: "text",
			notNull: true,
		},
		message: {
			type: "text",
			notNull: true,
		},
		related_question_id: {
			type: "integer",
			notNull: false,
			references: "questions(id)",
			onDelete: "CASCADE",
		},
		related_answer_id: {
			type: "integer",
			notNull: false,
			references: "answers(id)",
			onDelete: "CASCADE",
		},
		read: {
			type: "boolean",
			notNull: true,
			default: false,
		},
		created_at: {
			type: "timestamp",
			notNull: true,
			default: pgm.func("NOW()"),
		},
	});

	pgm.createIndex("notifications", "user_id");
	pgm.createIndex("notifications", "read");
	pgm.createIndex("notifications", "created_at");
}

/**
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
export async function down(pgm) {
	pgm.dropTable("notifications");
}
