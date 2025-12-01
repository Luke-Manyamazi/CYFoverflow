import db from "../db.js";

export const createQuestionDB = async (
	title,
	content,
	templateType,
	userId,
	browser = null,
	os = null,
	documentationLink = null,
	labelId,
) => {
	const result = await db.query(
		"INSERT INTO questions (title, content, template_type, user_id, browser, os, documentation_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
		[title, content, templateType, userId, browser, os, documentationLink],
	);

	const question = result.rows[0];
	if (labelId && labelId.length > 0) {
		for (const label of labelId) {
			await db.query(
				"INSERT INTO question_labels (question_id, label_id) VALUES($1, $2)",
				[question.id, label],
			);
		}
	}

	const labelResult = await db.query(
		"SELECT l.id, l.name FROM labels l JOIN question_labels ql ON l.id= ql.label_id WHERE ql.question_id = $1",
		[question.id],
	);
	question.labels = labelResult.rows;
	return question;
};

export const getAllQuestionsDB = async () => {
	const result = await db.query(
		`SELECT q.*, u.name as author_name
         FROM questions q
         JOIN users u ON q.user_id = u.id
         ORDER BY q.created_at DESC`,
	);
	const questions = result.rows;
	for (let question of questions) {
		const labelResult = await db.query(
			`SELECT l.id, l.name
             FROM labels l
             JOIN question_labels ql ON l.id = ql.label_id
             WHERE ql.question_id = $1`,
			[question.id],
		);
		question.labels = labelResult.rows;
	}

	return questions;
};
export const getQuestionsByUserIdDB = async (userId) => {
	const result = await db.query(
		`SELECT q.*, u.name as author_name
         FROM questions q
         JOIN users u ON q.user_id = u.id
         WHERE q.user_id = $1
         ORDER BY q.created_at DESC`,
		[userId],
	);
	return result.rows;
};
export const getQuestionByIdDB = async (id) => {
	const result = await db.query(
		`SELECT q.*, u.name as author_name FROM questions q Join users u ON q.user_id = u.id WHERE q.id = $1`,
		[id],
	);
	const question = result.rows[0];
	const labelResult = await db.query(
		`SELECT l.id, l.name
         FROM labels l
         JOIN question_labels ql ON l.id = ql.label_id
         WHERE ql.question_id = $1`,
		[id],
	);

	question.labels = labelResult.rows;

	return question;
};

export const deleteQuestionDB = async (id) => {
	await db.query(`DELETE FROM questions WHERE id = $1`, [id]);
	return true;
};

export const updateQuestionDB = async (
	id,
	title,
	content,
	templateType,
	browser = null,
	os = null,
	documentationLink = null,
	labelId,
) => {
	const result = await db.query(
		`UPDATE questions
         SET title = $1, content = $2, template_type = $3, browser = $4, os = $5, documentation_link = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
		[title, content, templateType, browser, os, documentationLink, id],
	);
	const question = result.rows[0];
	await db.query("DELETE FROM question_labels WHERE question_id = $1", [id]);

	for (const label of labelId) {
		await db.query(
			"INSERT INTO question_labels (question_id, label_id) VALUES ($1, $2)",
			[id, label],
		);
	}

	const labelResult = await db.query(
		`SELECT l.id, l.name
         FROM labels l
         JOIN question_labels ql ON l.id = ql.label_id
         WHERE ql.question_id = $1`,
		[question.id],
	);

	question.labels = labelResult.rows;

	return question;
};

export const getAllLabelsDB = async () => {
	const result = await db.query(`SELECT id, name FROM labels ORDER BY name`);
	return result.rows;
};

export const searchQuestionsByLabelsDB = async (labelId = []) => {
	const result = await db.query(
		`SELECT DISTINCT q.*, u.name as author_name
         FROM questions q
         JOIN users u ON q.user_id = u.id
         JOIN question_labels ql ON q.id = ql.question_id
         WHERE ql.label_id = ANY($1::int[])
         ORDER BY q.created_at DESC`,
		[labelId],
	);
	const questions = result.rows;

	for (let question of questions) {
		const labelResult = await db.query(
			`SELECT l.id, l.name FROM labels l JOIN question_labels ql ON l.id = ql.label_id WHERE ql.question_id =$1`,
			[question.id],
		);
		question.labels = labelResult.rows;
	}
	return questions;
};
