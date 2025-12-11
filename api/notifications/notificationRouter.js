import express from "express";

import { authenticateToken } from "../utils/auth.js";
import logger from "../utils/logger.js";

import {
	getNotificationsByUserId,
	getUnreadNotificationsCount,
	markNotificationAsRead,
	markAllNotificationsAsRead,
} from "./notificationService.js";

const router = express.Router();

router.get("/", authenticateToken(), async (req, res) => {
	try {
		const userId = req.user.id;
		const limit = Number.parseInt(req.query.limit || "50", 10);

		const notifications = await getNotificationsByUserId(userId, limit);

		res.json(notifications);
	} catch (error) {
		logger.error("Get notifications error: %O", error);
		res.status(500).json({ message: error.message });
	}
});

router.get("/unread-count", authenticateToken(), async (req, res) => {
	try {
		const userId = req.user.id;

		const count = await getUnreadNotificationsCount(userId);

		res.json({ count });
	} catch (error) {
		logger.error("Get unread notifications count error: %O", error);
		res.status(500).json({ message: error.message });
	}
});

router.put("/:id/read", authenticateToken(), async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		const notification = await markNotificationAsRead(
			Number.parseInt(id, 10),
			userId,
		);

		res.json(notification);
	} catch (error) {
		logger.error("Mark notification as read error: %O", error);
		if (error.message === "Notification not found or unauthorized") {
			res.status(404).json({ message: error.message });
		} else {
			res.status(500).json({ message: error.message });
		}
	}
});

router.put("/read-all", authenticateToken(), async (req, res) => {
	try {
		const userId = req.user.id;

		const result = await markAllNotificationsAsRead(userId);

		res.json(result);
	} catch (error) {
		logger.error("Mark all notifications as read error: %O", error);
		res.status(500).json({ message: error.message });
	}
});

export default router;
