import express from "express";
import supertest from "supertest";
import { describe, it, expect, vi } from "vitest";

import answersRouter from "../answers/answerRouter";

vi.mock("../answers/answerService.js", () => ({
	createAnswer: vi
		.fn()
		.mockResolvedValue({ id: 1, content: "Test answer", questionId: 5 }),
	getAnswersByQuestionId: vi
		.fn()
		.mockResolvedValue([{ id: 1, content: "Test answer", questionId: 5 }]),
	updateAnswer: vi
		.fn()
		.mockResolvedValue({ id: 1, content: "Updated answer", questionId: 5 }),
	deleteAnswer: vi.fn().mockResolvedValue(true),
}));

vi.mock("../utils/auth.js", () => ({
	authenticateToken: () => (req, res, next) => {
		req.user = { id: 1 }; // mock logged-in user
		next();
	},
}));

vi.mock("../utils/logger.js", () => ({
	default: { error: vi.fn() },
}));

const app = express();
app.use(express.json());
app.use(answersRouter);

describe("Answers API", () => {
	it("POST / answers creates an answer", async () => {
		const res = await supertest(app)
			.post("/")
			.send({ content: "Test answer", questionId: 5 })
			.expect(201);
		expect(res.body).toEqual({ id: 1, content: "Test answer", questionId: 5 });
	});

	it("PUT /answers/:id updates an answer", async () => {
		const res = await supertest(app)
			.put("/1")
			.send({ content: "Updated answer" })
			.expect(200);
		expect(res.body).toEqual({
			id: 1,
			content: "Updated answer",
			questionId: 5,
		});
	});

	it("DELETE /answers/:id deletes an answer", async () => {
		const res = await supertest(app).delete("/1").expect(200);
		expect(res.body).toEqual({ message: "Answer deleted" });
	});
});
