import { describe, it, expect, beforeEach } from "vitest";

import db from "../db.js";

import { createRequest } from "./testUtils.js";

describe("Authentication - Login", () => {
	beforeEach(async () => {
		// Clear users table before each test
		await db.query("DELETE FROM users");
	});

	describe("POST /api/auth/login", () => {
		it("should return 401 if the user does not exist", async () => {
			const request = await createRequest();

			const response = await request
				.post("/api/auth/login")
				.send({ email: "nobody@example.com", password: "Password123!" })
				.expect(401);

			expect(response.body.message).toBe("Invalid credentials.");
		});

		it("should return 401 if the password is incorrect", async () => {
			const request = await createRequest();

			// First create a user
			const userData = {
				name: "John Doe",
				email: "john@example.com",
				password: "Password123!",
			};
			await request.post("/api/auth/signup").send(userData).expect(201);

			// Attempt login with wrong password
			const response = await request
				.post("/api/auth/login")
				.send({ email: "john@example.com", password: "WrongPassword!" })
				.expect(401);

			expect(response.body.message).toBe("Invalid credentials.");
		});

		it("should return 200 and a token when credentials are correct", async () => {
			const request = await createRequest();

			// Signup first
			const userData = {
				name: "Jane Doe",
				email: "jane@example.com",
				password: "Password123!",
			};
			await request.post("/api/auth/signup").send(userData).expect(201);

			// Login with correct credentials
			const response = await request
				.post("/api/auth/login")
				.send({ email: "jane@example.com", password: "Password123!" })
				.expect(200);

			expect(response.body).toHaveProperty("token");
			expect(response.body).toHaveProperty("user");
			expect(response.body.user).toHaveProperty("id");
			expect(response.body.user).toHaveProperty("name", userData.name);
			expect(response.body.user).toHaveProperty(
				"email",
				userData.email.toLowerCase(),
			);
		});
	});
});
