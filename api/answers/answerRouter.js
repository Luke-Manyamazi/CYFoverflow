import express from "express";

import { authenticateToken } from "../utils/auth.js";
import logger from "../utils/logger.js";

import {
	createAnswer,
	getAnswersByQuestionId,
	updateAnswer,
	deleteAnswer,
} from "./answerService.js";

const router = express.Router();

router.post("/", authenticateToken(), async (req, res) => {
	try {
		const { content, questionId } = req.body;
		const userId = req.user.id;

		const answer = await createAnswer(content, userId, questionId);
		res.status(201).json(answer);
	} catch (error) {
		logger.error("Create answer error: %O", error);
		res.status(500).json({ message: error.message });
	}
});

router.get("/:questionId", async (req, res) => {
	try {
		const { questionId } = req.params;
		const answers = await getAnswersByQuestionId(questionId);
		res.json(answers);
	} catch (error) {
		logger.error("Get answers by questionId error: %O", error);
		res.status(500).json({ message: error.message });
	}
});

router.put("/:id", authenticateToken(), async (req, res) => {
	try {
		const { id } = req.params;
		const { content } = req.body;
		const userId = req.user.id;

		const updated = await updateAnswer(id, content, userId);
		res.json(updated);
	} catch (error) {
		logger.error("Update answer error: %O", error);
		res.status(500).json({ message: error.message });
	}
});

router.delete("/:id", authenticateToken(), async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		await deleteAnswer(id, userId);
		res.json({ message: "Answer deleted" });
	} catch (error) {
		logger.error("Delete answer error: %O", error);
		res.status(500).json({ message: error.message });
	}
});

export default router;
