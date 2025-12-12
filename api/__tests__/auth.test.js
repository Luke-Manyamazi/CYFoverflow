import { describe, it, expect, beforeEach } from "vitest";

import db from "../db.js";

import { createRequest } from "./testUtils.js";

describe("Authentication", () => {
	beforeEach(async () => {
		await db.query("DELETE FROM users");
	});

	describe("POST /api/auth/signup", () => {
		it("should create a new user with valid data", async () => {
			const request = await createRequest();

			const userData = {
				name: "John Doe",
				email: "john@example.com",
				password: "Password123!",
			};

			const response = await request
				.post("/api/auth/signup")
				.send(userData)
				.expect(201);

			expect(response.body).toHaveProperty("newUser");
			expect(response.body).toHaveProperty("token");
			expect(response.body.newUser).toHaveProperty("id");
			expect(response.body.newUser).toHaveProperty("name");
			expect(response.body.newUser).toHaveProperty("email");
			expect(response.body.newUser.name).toBe(userData.name);
			expect(response.body.newUser.email).toBe(userData.email.toLowerCase());
			expect(response.body.newUser.password_hash).toBeUndefined();
			expect(response.body.token).toBeTruthy();
		});

		it("should normalize email to lowercase", async () => {
			const request = await createRequest();

			const userData = {
				name: "Jane Smith",
				email: "JANE@EXAMPLE.COM",
				password: "Password123!",
			};

			const response = await request
				.post("/api/auth/signup")
				.send(userData)
				.expect(201);

			expect(response.body.newUser.email).toBe("jane@example.com");
		});

		it("should trim whitespace from name and email", async () => {
			const request = await createRequest();

			const userData = {
				name: "  Bob Wilson  ",
				email: "  bob@example.com  ",
				password: "Password123!",
			};

			const response = await request
				.post("/api/auth/signup")
				.send(userData)
				.expect(201);

			expect(response.body.newUser.name).toBe("Bob Wilson");
			expect(response.body.newUser.email).toBe("bob@example.com");
		});

		it("should hash the password before storing", async () => {
			const request = await createRequest();

			const userData = {
				name: "Test User",
				email: "test@example.com",
				password: "Password123!",
			};

			await request.post("/api/auth/signup").send(userData).expect(201);

			const result = await db.query(
				"SELECT hashed_password FROM users WHERE email = $1",
				["test@example.com"],
			);
			const storedPassword = result.rows[0].hashed_password;

			expect(storedPassword).not.toBe(userData.password);
			expect(storedPassword).toMatch(/^\$2[aby]\$/);
			expect(storedPassword.length).toBeGreaterThan(50);
		});

		it("should return 409 if email already exists", async () => {
			const request = await createRequest();

			const userData = {
				name: "First User",
				email: "duplicate@example.com",
				password: "Password123!",
			};

			await request.post("/api/auth/signup").send(userData).expect(201);
			const duplicateData = {
				name: "Second User",
				email: "duplicate@example.com",
				password: "DifferentPass123!",
			};

			const response = await request
				.post("/api/auth/signup")
				.send(duplicateData)
				.expect(409);

			expect(response.body).toHaveProperty("message");
			expect(response.body.message).toContain("already exists");
		});

		it("should return 409 for case-insensitive duplicate emails", async () => {
			const request = await createRequest();

			const userData = {
				name: "First User",
				email: "test@example.com",
				password: "Password123!",
			};

			await request.post("/api/auth/signup").send(userData).expect(201);

			const duplicateData = {
				name: "Second User",
				email: "TEST@EXAMPLE.COM",
				password: "Password123!",
			};

			await request.post("/api/auth/signup").send(duplicateData).expect(409);
		});

		it("should return 400 if name is missing", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({ email: "test@example.com", password: "Password123!" })
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
		});

		it("should return 400 if email is missing", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({ name: "Test User", password: "Password123!" })
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
		});

		it("should return 400 if password is missing", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({ name: "Test User", email: "test@example.com" })
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
		});

		it("should return 400 if name is too short", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({
					name: "A",
					email: "test@example.com",
					password: "Password123!",
				})
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
			expect(response.body.details).toContain("at least 2 characters");
		});

		it("should return 400 if email is invalid", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({
					name: "Test User",
					email: "not-an-email",
					password: "Password123!",
				})
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
			expect(response.body.details).toContain("valid email");
		});

		it("should return 400 if password is too short", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({
					name: "Test User",
					email: "test@example.com",
					password: "Pass1!",
				})
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
			expect(response.body.details).toContain("at least 8 characters");
		});

		it("should return 400 if password lacks uppercase letter", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({
					name: "Test User",
					email: "test@example.com",
					password: "password123!",
				})
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
			expect(response.body.details).toContain("uppercase letter");
		});

		it("should return 400 if password lacks lowercase letter", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({
					name: "Test User",
					email: "test@example.com",
					password: "PASSWORD123!",
				})
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
			expect(response.body.details).toContain("lowercase letter");
		});

		it("should return 400 if password lacks number", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({
					name: "Test User",
					email: "test@example.com",
					password: "Password!",
				})
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
			expect(response.body.details).toContain("number");
		});

		it("should return 400 if password lacks special character", async () => {
			const request = await createRequest();
			const response = await request
				.post("/api/auth/signup")
				.send({
					name: "Test User",
					email: "test@example.com",
					password: "Password123",
				})
				.expect(400);

			expect(response.body.error).toBe("Validation failed");
			expect(response.body.details).toContain("special character");
		});

		it("should persist user to database", async () => {
			const request = await createRequest();

			const userData = {
				name: "Database Test",
				email: "db@example.com",
				password: "Password123!",
			};

			await request.post("/api/auth/signup").send(userData).expect(201);

			const result = await db.query(
				"SELECT id, name, email FROM users WHERE email = $1",
				["db@example.com"],
			);

			expect(result.rows).toHaveLength(1);
			expect(result.rows[0].name).toBe(userData.name);
			expect(result.rows[0].email).toBe(userData.email.toLowerCase());
		});

		it("should return a valid JWT token", async () => {
			const request = await createRequest();

			const userData = {
				name: "Token Test",
				email: "token@example.com",
				password: "Password123!",
			};

			const response = await request
				.post("/api/auth/signup")
				.send(userData)
				.expect(201);

			const tokenParts = response.body.token.split(".");
			expect(tokenParts).toHaveLength(3);
			expect(response.body.token.length).toBeGreaterThan(50);
		});
	});
});
