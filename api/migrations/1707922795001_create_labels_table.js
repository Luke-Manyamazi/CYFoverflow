/**
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */

export async function up(pgm) {
	pgm.createTable("labels", {
		id: { type: "serial", primaryKey: true },
		name: { type: "text", notNull: true, unique: true },
		created_at: {
			type: "timestamp",
			notNull: true,
			default: pgm.func("Now()"),
		},
	});
}

export async function down(pgm) {
	pgm.dropTable("labels");
}
