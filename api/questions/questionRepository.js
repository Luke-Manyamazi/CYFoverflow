import db from "../db.js";

export const createQuestionDB = async (
	title,
	body,
	templateType,
	userId,
	browser = null,
	os = null,
	documentationLink = null,
) => {
	const result = await db.query(
		"INSERT INTO questions (title, body, template_type, user_id, browser, os, documentation_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
		[title, body, templateType, userId, browser, os, documentationLink],
	);

	return result.rows[0];
};

export const getAllQuestionsDB = async () => {
	const result = await db.query(
		`SELECT q.*, u.name as author_name
         FROM questions q
         JOIN users u ON q.user_id = u.id
         ORDER BY q.created_at DESC`,
	);
	return result.rows;
};

export const getQuestionByIdDB = async (id) => {
	const result = await db.query(
		`SELECT q.*, u.name as author_name FROM questions q Join users u ON q.user_id = u.id WHERE q.id = $1`,
		[id],
	);
	return result.rows[0];
};

export const deleteQuestionDB = async (id) => {
	await db.query(`DELETE FROM questions WHERE id = $1`, [id]);
	return true;
};

export const updateQuestionDB = async (
	id,
	title,
	body,
	templateType,
	browser = null,
	os = null,
	documentationLink = null,
) => {
	const result = await db.query(
		`UPDATE questions
         SET title = $1, body = $2, template_type = $3, browser = $4, os = $5, documentation_link = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
		[title, body, templateType, browser, os, documentationLink, id],
	);
	return result.rows[0];
};
