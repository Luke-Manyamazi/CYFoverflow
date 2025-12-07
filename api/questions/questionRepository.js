import db from "../db.js";
import { generateSlug, generateUniqueSlug } from "../utils/slug.js";

let contentColumnName = null;
const getContentColumnName = async () => {
	if (contentColumnName) return contentColumnName;

	const result = await db.query(`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = 'questions'
		AND column_name IN ('content', 'body')
		ORDER BY CASE WHEN column_name = 'content' THEN 1 ELSE 2 END
	`);

	if (result.rows.length > 0) {
		contentColumnName = result.rows[0].column_name;
	} else {
		contentColumnName = "content";
	}

	return contentColumnName;
};

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
	if (!content) {
		throw new Error("Content cannot be null or undefined in repository");
	}
	const columnName = await getContentColumnName();

	const baseSlug = generateSlug(title);
	const slug = await generateUniqueSlug(baseSlug, async (slugToCheck) => {
		const result = await db.query("SELECT id FROM questions WHERE slug = $1", [
			slugToCheck,
		]);
		return result.rows.length > 0;
	});

	const result = await db.query(
		`INSERT INTO questions (title, ${columnName}, template_type, user_id, browser, os, documentation_link, slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
		[
			title,
			content,
			templateType,
			userId,
			browser,
			os,
			documentationLink,
			slug,
		],
	);

	const question = result.rows[0];
	if (labelId && labelId.length > 0) {
		for (const label of labelId) {
			try {
				await db.query(
					"INSERT INTO question_labels (question_id, label_id) VALUES($1, $2)",
					[question.id, label],
				);
			} catch (error) {
				if (error.code === "23503") {
					throw new Error(`Label with ID ${label} does not exist`);
				}
				throw error;
			}
		}
	}

	const labelResult = await db.query(
		"SELECT l.id, l.name FROM labels l JOIN question_labels ql ON l.id= ql.label_id WHERE ql.question_id = $1",
		[question.id],
	);
	question.labels = labelResult.rows;
	return question;
};

export const getAllQuestionsDB = async (limit = null, page = null) => {
	let query = `SELECT q.*, u.name as author_name,
         COALESCE(answer_counts.answer_count, 0) as answer_count
         FROM questions q
         JOIN users u ON q.user_id = u.id
         LEFT JOIN (
             SELECT question_id, COUNT(*) as answer_count
             FROM answers
             GROUP BY question_id
         ) answer_counts ON q.id = answer_counts.question_id
         ORDER BY q.created_at DESC`;

	const params = [];

	if (limit && page) {
		const offset = (page - 1) * limit;
		query += ` LIMIT $1 OFFSET $2`;
		params.push(limit, offset);
	} else if (limit) {
		query += ` LIMIT $1`;
		params.push(limit);
	}

	const result = await db.query(query, params);
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

export const getTotalQuestionsCountDB = async () => {
	const result = await db.query(`SELECT COUNT(*) as total FROM questions`);
	return parseInt(result.rows[0].total, 10);
};
export const getQuestionsByUserIdDB = async (userId) => {
	const result = await db.query(
		`SELECT q.*, u.name as author_name,
         COALESCE(answer_counts.answer_count, 0) as answer_count
         FROM questions q
         JOIN users u ON q.user_id = u.id
         LEFT JOIN (
             SELECT question_id, COUNT(*) as answer_count
             FROM answers
             GROUP BY question_id
         ) answer_counts ON q.id = answer_counts.question_id
         WHERE q.user_id = $1
         ORDER BY q.created_at DESC`,
		[userId],
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
export const getQuestionByIdDB = async (idOrSlug) => {
	const isPureNumeric = /^\d+$/.test(idOrSlug);

	let result;
	if (isPureNumeric) {
		result = await db.query(
			`SELECT q.*, u.name as author_name, u.email as author_email,
			 COALESCE(answer_counts.answer_count, 0) as answer_count
			 FROM questions q
			 JOIN users u ON q.user_id = u.id
			 LEFT JOIN (
				 SELECT question_id, COUNT(*) as answer_count
				 FROM answers
				 GROUP BY question_id
			 ) answer_counts ON q.id = answer_counts.question_id
			 WHERE q.id = $1`,
			[idOrSlug],
		);
	} else {
		result = await db.query(
			`SELECT q.*, u.name as author_name, u.email as author_email,
			 COALESCE(answer_counts.answer_count, 0) as answer_count
			 FROM questions q
			 JOIN users u ON q.user_id = u.id
			 LEFT JOIN (
				 SELECT question_id, COUNT(*) as answer_count
				 FROM answers
				 GROUP BY question_id
			 ) answer_counts ON q.id = answer_counts.question_id
			 WHERE q.slug = $1`,
			[idOrSlug],
		);
	}

	const question = result.rows[0];
	if (!question) {
		return null;
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
	const columnName = await getContentColumnName();

	const existingQuestion = await db.query(
		"SELECT title FROM questions WHERE id = $1",
		[id],
	);
	const titleChanged = existingQuestion.rows[0]?.title !== title;

	let slug = null;
	if (titleChanged) {
		const baseSlug = generateSlug(title);
		slug = await generateUniqueSlug(baseSlug, async (slugToCheck) => {
			const result = await db.query(
				"SELECT id FROM questions WHERE slug = $1 AND id != $2",
				[slugToCheck, id],
			);
			return result.rows.length > 0;
		});
	}

	const updateFields = titleChanged
		? `title = $1, ${columnName} = $2, template_type = $3, browser = $4, os = $5, documentation_link = $6, slug = $7, updated_at = NOW()`
		: `title = $1, ${columnName} = $2, template_type = $3, browser = $4, os = $5, documentation_link = $6, updated_at = NOW()`;

	const params = titleChanged
		? [title, content, templateType, browser, os, documentationLink, slug, id]
		: [title, content, templateType, browser, os, documentationLink, id];

	const result = await db.query(
		`UPDATE questions SET ${updateFields} WHERE id = $${params.length} RETURNING *`,
		params,
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
		`SELECT DISTINCT q.*, u.name as author_name,
         COALESCE(answer_counts.answer_count, 0) as answer_count
         FROM questions q
         JOIN users u ON q.user_id = u.id
         JOIN question_labels ql ON q.id = ql.question_id
         LEFT JOIN (
             SELECT question_id, COUNT(*) as answer_count
             FROM answers
             GROUP BY question_id
         ) answer_counts ON q.id = answer_counts.question_id
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

export const updateSolvedStatusDB = async (id, isSolved) => {
	const result = await db.query(
		`UPDATE questions
         SET is_solved = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
		[isSolved, id],
	);

	return result.rows[0];
};
