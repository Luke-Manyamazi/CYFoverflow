import db from "../db.js";

// Helper function to detect which column exists (prefer 'content', fallback to 'body')
let answerContentColumnName = null;
const getAnswerContentColumnName = async () => {
	if (answerContentColumnName) return answerContentColumnName;

	const result = await db.query(`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = 'answers'
		AND column_name IN ('content', 'body')
		ORDER BY CASE WHEN column_name = 'content' THEN 1 ELSE 2 END
	`);

	if (result.rows.length > 0) {
		// Prefer 'content' if it exists, otherwise use 'body'
		answerContentColumnName = result.rows[0].column_name;
	} else {
		// Default to 'content' if neither exists (shouldn't happen)
		answerContentColumnName = "content";
	}

	return answerContentColumnName;
};

export const createAnswerDB = async ({ content, user_id, question_id }) => {
	const columnName = await getAnswerContentColumnName();
	const result = await db.query(
		`INSERT INTO answers(${columnName},user_id, question_id)
        VALUES($1, $2, $3)
        RETURNING *`,
		[content, user_id, question_id],
	);
	return result.rows[0];
};

export const getAnswerByQuestionIdDB = async (questionId) => {
	const columnName = await getAnswerContentColumnName();
	const result = await db.query(
		`SELECT a.id, a.${columnName} AS content, a.user_id, a.question_id, a.created_at, a.updated_at, u.name AS author_name 
        FROM answers a 
        JOIN users u ON a.user_id = u.id
        WHERE a.question_id = $1
        ORDER BY a.created_at ASC`,
		[questionId],
	);
	return result.rows;
};

export const updateAnswerDB = async (id, content) => {
	const columnName = await getAnswerContentColumnName();
	const result = await db.query(
		`UPDATE answers
        SET ${columnName} = $1,
        updated_at = NOW()
        WHERE id = $2
        RETURNING *`,
		[content, id],
	);
	return result.rows[0];
};

export const deleteAnswerDB = async (id) => {
	await db.query(`DELETE FROM answers WHERE id = $1`, [id]);
	return true;
};

export const getAnswerByIdDB = async (id) => {
	const columnName = await getAnswerContentColumnName();
	const result = await db.query(
		`SELECT id, ${columnName} AS content, user_id, question_id, created_at, updated_at FROM answers WHERE id = $1`,
		[id],
	);
	return result.rows[0];
};
