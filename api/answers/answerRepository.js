import db from "../db.js";

export const createAnswerDB = async ({ content, user_id, question_id }) => {
	const result = await db.query(
		`INSERT INTO answers(content,user_id, question_id)
        VALUES($1, $2, $3)
        RETURNING *`,
		[content, user_id, question_id],
	);
	return result.rows[0];
};

export const getAnswerByQuestionIdDB = async (questionId) => {
	const result = await db.query(
		`SELECT a.*, u.name AS author_name 
        FROM answers a 
        JOIN users u ON a.user_id = u.id
        WHERE a.question_id = $1
        ORDER BY a.created_at ASC`,
		[questionId],
	);
	return result.rows;
};

export const updateAnswerDB = async (id, content) => {
	const result = await db.query(
		`UPDATE answers
        SET content = $1,
        updated_at = NOW()
        WHERE id = $2
        RETURNING *`,
		[id, content],
	);
	return result.rows[0];
};

export const deleteAnswerDB = async (id) => {
	await db.query(`DELETE FROM answers WHERE id = $1`, [id]);
	return true;
};

export const getAnswerByIdDB = async (id) => {
	const result = await db.query(`SELECT * FROM answers WHERE id = $1`, [id]);
	return result.rows[0];
};
