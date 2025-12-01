/**
 * @param {import("node-pg-migrate").MigrationBuilder} pgm
 */

export async function up(pgm) {
	pgm.createTable("question_labels", {
		question_id: {
			type: "integer",
			notNull: true,
			references: "questions(id)",
			onDelete: "CASCADE",
		},
		label_id: {
			type: "integer",
			notNull: true,
			references: "labels(id)",
			onDelete: "CASCADE",
		},
	});

	pgm.addConstraint("question_labels", "pk_question_labels", {
		primaryKey: ["question_id", "label_id"],
	});

	pgm.sql(`
        
        INSERT INTO labels (name) VALUES 
        ('HTML'),
        ('CSS'),
        ('JavaScript'),
        ('Java'),
        ('React'),
        ('Python'),
        ('ITD'),
        ('ITP'),
        ('Piscine'),
        ('SDC')
        ON CONFLICT (name) DO NOTHING;

        `);
}

export async function down(pgm) {
	pgm.dropTable("question_labels");
}
