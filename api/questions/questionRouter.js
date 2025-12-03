import express from "express";

import { authenticateToken } from "../utils/auth.js";
import logger from "../utils/logger.js";

import {
	createQuestion,
	getAllQuestions,
	getQuestionById,
	getQuestionsByUserId,
	updateQuestion,
	deleteQuestion,
	getAllLabels,
	searchQuestionsByLabels,
	getTotalQuestionsCount,
} from "./questionService.js";

const router = express.Router();

router.get("/my-questions", authenticateToken(), async (req, res) => {
	try {
		const questions = await getQuestionsByUserId(req.user.id);
		res.json(questions);
	} catch (error) {
		logger.error("Get my questions error: %0", error);
		res.status(500).json({ error: "failed to fetch user's questions" });
	}
});
router.post("/", authenticateToken(), async (req, res) => {
	try {
		const {
			title,
			content,
			templateType,
			browser,
			os,
			documentationLink,
			labelId,
		} = req.body;

		const question = await createQuestion(
			req.user.id,
			title,
			content,
			templateType,
			browser,
			os,
			documentationLink,
			labelId,
		);
		res.status(201).json(question);
	} catch (error) {
		logger.error("Create a question error: %0", error);
		res.status(500).json({ error: "failed to create question" });
	}
});

router.get("/", async (req, res) => {
	try {
		const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
		const page = req.query.page ? parseInt(req.query.page, 10) : null;

		// If limit is provided without page, it's for recent questions (no pagination)
		// If page is provided, it's for pagination (limit defaults to 10 if not provided)
		const paginationLimit = page ? limit || 10 : limit;

		const questions = await getAllQuestions(paginationLimit, page);

		// If pagination is requested, return paginated response
		if (page) {
			const total = await getTotalQuestionsCount();
			const totalPages = Math.ceil(total / paginationLimit);

			res.json({
				questions,
				pagination: {
					currentPage: page,
					totalPages,
					totalItems: total,
					itemsPerPage: paginationLimit,
				},
			});
		} else {
			// Simple response for recent questions (no pagination)
			res.json(questions);
		}
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
		const {
			title,
			content,
			templateType,
			browser,
			os,
			documentationLink,
			labelId,
		} = req.body;

		const question = await updateQuestion(
			Number(id),
			req.user.id,
			title,
			content,
			templateType,
			browser,
			os,
			documentationLink,
			labelId,
		);
		res.status(201).json(question);
	} catch (error) {
		logger.error("update a question error: %0", error);
		res.status(500).json({ error: "failed to update question" });
	}
});

router.delete("/:id", authenticateToken(), async (req, res) => {
	try {
		const { id } = req.params;
		await deleteQuestion(Number(id), req.user.id);
		res.status(200).json({ message: "Question deleted successfully" });
	} catch (error) {
		logger.error("delete a question error: %0", error);
		res.status(500).json({ error: "failed to delete question" });
	}
});

router.get("/labels/all", async (__, res) => {
	try {
		const labels = await getAllLabels();
		res.json(labels);
	} catch (error) {
		logger.error("Get labels error: %0", error);
		res.status(500).json({ error: "failed to fetch labels" });
	}
});

router.post("/search/by-labels", async (req, res) => {
	try {
		const { labelId } = req.body;
		const questions = await searchQuestionsByLabels(labelId);
		res.json(questions);
	} catch (error) {
		logger.error("Search questions by labels error: %0", error);
		res
			.status(500)
			.json({ error: error.message || "Failed to search questions by labels" });
	}
});

export default router;
