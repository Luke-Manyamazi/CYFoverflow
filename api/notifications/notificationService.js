import logger from "../utils/logger.js";

import * as repository from "./notificationRepository.js";

export const createNotification = async ({
	userId,
	type,
	message,
	relatedQuestionId = null,
	relatedAnswerId = null,
}) => {
	try {
		if (!userId || !type || !message) {
			throw new Error("userId, type, and message are required");
		}

		const notification = await repository.createNotificationDB({
			userId,
			type,
			message,
			relatedQuestionId,
			relatedAnswerId,
		});

		logger.info("Notification created", {
			notificationId: notification.id,
			userId,
			type,
		});

		return notification;
	} catch (error) {
		logger.error("Error creating notification:", error);
		throw error;
	}
};

export const getNotificationsByUserId = async (userId, limit = 50) => {
	try {
		if (!userId) {
			throw new Error("userId is required");
		}

		const notifications = await repository.getNotificationsByUserIdDB(
			userId,
			limit,
		);

		return notifications;
	} catch (error) {
		logger.error("Error getting notifications by user ID:", error);
		throw error;
	}
};

export const getUnreadNotificationsCount = async (userId) => {
	try {
		if (!userId) {
			throw new Error("userId is required");
		}

		const count = await repository.getUnreadNotificationsCountDB(userId);

		return count;
	} catch (error) {
		logger.error("Error getting unread notifications count:", error);
		throw error;
	}
};

export const markNotificationAsRead = async (notificationId, userId) => {
	try {
		if (!notificationId || !userId) {
			throw new Error("notificationId and userId are required");
		}

		const notification = await repository.markNotificationAsReadDB(
			notificationId,
			userId,
		);

		if (!notification) {
			throw new Error("Notification not found or unauthorized");
		}

		return notification;
	} catch (error) {
		logger.error("Error marking notification as read:", error);
		throw error;
	}
};

export const markAllNotificationsAsRead = async (userId) => {
	try {
		if (!userId) {
			throw new Error("userId is required");
		}

		const count = await repository.markAllNotificationsAsReadDB(userId);

		return { count };
	} catch (error) {
		logger.error("Error marking all notifications as read:", error);
		throw error;
	}
};
