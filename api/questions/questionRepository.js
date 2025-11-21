import db from "../db.js";

export const createQuestionDB = async (
  title,
  body,
  tags,
  templateType,
  userId
) => {
  const result = await db.query(
    "INSERT INTO questions (title, body, tags, template_type, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [title, body, tags, templateType, userId]
  );

  return result.rows[0];
};

export const getAllQuestionsDB = async () => {
    const result = await db.query(
        `SELECT q.*, u.name as author_name
         FROM questions q
         JOIN users u ON q.user_id = u.id
         ORDER BY q.created_at DESC`
    );
    return result.rows;
}

export const getQuestionByIdDB = async (id) => {
  const result = await db.query(
    `SELECT * FROM questions WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

export const deleteQuestionDB = async (id) => {
   await db.query(
    `DELETE FROM questions WHERE id = $1`,
    [id]
  );
  return true;
};

export const updateQuestionDB = async (id, title, body, tags, templateType) => {
    const result = await db.query(
        `UPDATE questions
         SET title = $1, body = $2, tags = $3, template_type = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
        [title, body, tags, templateType, id]
  );
  return result.rows[0];
};
