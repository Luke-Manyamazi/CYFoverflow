/**
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */
export async function up(pgm) {
	pgm.createTable("questions", {
		id: { type: "serial", primaryKey: true },
		title: { type: "text", notNull: true },
		body: { type: "text", notNull: true },
		user_id: {
			type: "integer",
			notNull: true,
			references: "users(id)",
			onDelete: "CASCADE",
		},
		template_type: { type: "text", notNull: false },
		browser: { type: "text", notNull: false }, // For bug-report template
		os: { type: "text", notNull: false }, // For bug-report template
		documentation_link: { type: "text", notNull: false }, // For how-to template
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
	pgm.dropTable("questions");
}

export const shorthands = {};
