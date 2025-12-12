import express from "express";
import request from "supertest";
import { describe, it, expect, afterEach, vi } from "vitest";

vi.mock("../utils/logger.js", () => ({
	default: { error: vi.fn(), info: vi.fn() },
}));

vi.mock("../utils/auth.js", () => ({
	authenticateToken: () => (req, res, next) => next(),
}));

// Mock questionService with all named exports
const getQuestionByIdMock = vi.fn();

vi.mock("../questions/questionService.js", async () => {
	return {
		createQuestion: vi.fn(),
		getAllQuestions: vi.fn(),
		getQuestionById: getQuestionByIdMock,
		getQuestionsByUserId: vi.fn(),
		updateQuestion: vi.fn(),
		deleteQuestion: vi.fn(),
		getAllLabels: vi.fn(),
		searchQuestionsByLabels: vi.fn(),
		searchQuestionsByText: vi.fn(),
		getTotalQuestionsCount: vi.fn(),
		getSearchQuestionsCount: vi.fn(),
		markQuestionSolved: vi.fn(),
	};
});

// Import router AFTER mocks
const { default: router } = await import("../questions/questionRouter.js");

// Setup Express app
const app = express();
app.use(express.json());
app.use("/questions", router);

describe("GET /questions/:id", () => {
	afterEach(() => {
		getQuestionByIdMock.mockReset();
	});

	it("returns 200 when question exists", async () => {
		const mockQuestion = { id: "123", title: "Test", content: "Help" };
		getQuestionByIdMock.mockResolvedValue(mockQuestion);

		const res = await request(app).get("/questions/123");

		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual(mockQuestion);
		expect(getQuestionByIdMock).toHaveBeenCalledWith("123");
	});

	it("returns 404 when the question does not exist", async () => {
		getQuestionByIdMock.mockResolvedValue(null);

		const res = await request(app).get("/questions/999");

		expect(res.statusCode).toBe(404);
		expect(res.body).toEqual({ error: "Question not found" });
	});

	it("returns 500 when the service throws an error", async () => {
		getQuestionByIdMock.mockRejectedValue(new Error("Database failure"));

		const res = await request(app).get("/questions/123");

		expect(res.statusCode).toBe(500);
		expect(res.body).toEqual({ error: " question not found " });
	});
});
