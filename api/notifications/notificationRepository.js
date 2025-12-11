import db from "../db.js";
import logger from "../utils/logger.js";

export const createNotificationDB = async ({
	userId,
	type,
	message,
	relatedQuestionId = null,
	relatedAnswerId = null,
}) => {
	try {
		const result = await db.query(
			`INSERT INTO notifications (user_id, type, message, related_question_id, related_answer_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
			[userId, type, message, relatedQuestionId, relatedAnswerId],
		);
		return result.rows[0];
	} catch (error) {
		logger.error("Error creating notification:", error);
		throw error;
	}
};

export const getNotificationsByUserIdDB = async (userId, limit = 50) => {
	try {
		const result = await db.query(
			`SELECT 
                n.id,
                n.user_id,
                n.type,
                n.message,
                n.related_question_id,
                n.related_answer_id,
                n.read,
                n.created_at,
                q.slug AS question_slug
            FROM notifications n
            LEFT JOIN questions q ON n.related_question_id = q.id
            WHERE n.user_id = $1
            ORDER BY n.created_at DESC
            LIMIT $2`,
			[userId, limit],
		);
		return result.rows;
	} catch (error) {
		logger.error("Error getting notifications by user ID:", error);
		throw error;
	}
};

export const getUnreadNotificationsCountDB = async (userId) => {
	try {
		const result = await db.query(
			`SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = $1 AND read = false`,
			[userId],
		);
		return Number.parseInt(result.rows[0].count, 10);
	} catch (error) {
		logger.error("Error getting unread notifications count:", error);
		throw error;
	}
};

export const markNotificationAsReadDB = async (notificationId, userId) => {
	try {
		const result = await db.query(
			`UPDATE notifications
            SET read = true
            WHERE id = $1 AND user_id = $2
            RETURNING *`,
			[notificationId, userId],
		);
		return result.rows[0];
	} catch (error) {
		logger.error("Error marking notification as read:", error);
		throw error;
	}
};

export const markAllNotificationsAsReadDB = async (userId) => {
	try {
		const result = await db.query(
			`UPDATE notifications
            SET read = true
            WHERE user_id = $1 AND read = false
            RETURNING id`,
			[userId],
		);
		return result.rows.length;
	} catch (error) {
		logger.error("Error marking all notifications as read:", error);
		throw error;
	}
};
