import express from "express";

import { authenticateToken } from "../utils/auth.js";
import logger from "../utils/logger.js";

import {
	createQuestion,
	getAllQuestions,
	getQuestionById,
	updateQuestion,
	deleteQuestion,
} from "./questionService.js";

const router = express.Router();
router.post("/", authenticateToken(), async (req, res) => {
	try {
		const { title, content, templateType, browser, os, documentationLink } =
			req.body;

		const question = await createQuestion(
			req.user.id,
			title,
			content,
			templateType,
			browser,
			os,
			documentationLink,
		);
		res.status(201).json(question);
	} catch (error) {
		logger.error("Create a question error: %0", error);
		res.status(500).json({ error: "failed to create question" });
	}
});

router.get("/", async (__, res) => {
	try {
		const questions = await getAllQuestions();
		res.json(questions);
	} catch (error) {
		logger.error("Get questions error: %0", error);
		res.status(500).json({ error: "failed to fetch questions" });
	}
});

router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const question = await getQuestionById(Number(id));
		res.json(question);
	} catch (error) {
		logger.error("get a question by id error: %0", error);
		res.status(500).json({ error: " question not found " });
	}
});

router.put("/:id", authenticateToken(), async (req, res) => {
	try {
		const { id } = req.params;
		const { title, content, templateType, browser, os, documentationLink } =
			req.body;

		const question = await updateQuestion(
			Number(id),
			req.user.id,
			title,
			content,
			templateType,
			browser,
			os,
			documentationLink,
		);
		res.status(201).json(question);
	} catch (error) {
		logger.error("update a question error: %0", error);
		res.status(500).json({ error: "fail to update question" });
	}
});
router.delete("/:id", authenticateToken(), async (req, res) => {
	try {
		const { id } = req.params;
		await deleteQuestion(Number(id), req.user.id);
		res.sendStatus(204);
	} catch (error) {
		logger.error("delete a question error: %0", error);
		res.status(500).json({ error: "fail to delete question" });
	}
});

export default router;
