import bcrypt from "bcrypt";
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as authRepository from "../auth/authRepository.js";
import * as authService from "../auth/authService.js";

// Mock the repository and bcrypt
vi.mock("../auth/authRepository.js");
vi.mock("bcrypt");

beforeEach(() => {
	vi.clearAllMocks();
});

describe("authService.signUp", () => {
	it("creates a new user when email does not exist", async () => {
		authRepository.findUserByEmail.mockResolvedValue(null);
		authRepository.createUser.mockResolvedValue({
			id: 1,
			name: "Test User",
			email: "test@example.com",
		});
		bcrypt.hash.mockResolvedValue("hashedPassword");

		const result = await authService.signUp(
			"Test User",
			"test@example.com",
			"Password123!",
		);

		expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
			"test@example.com",
		);
		expect(bcrypt.hash).toHaveBeenCalledWith("Password123!", 10);
		expect(authRepository.createUser).toHaveBeenCalledWith(
			"Test User",
			"test@example.com",
			"hashedPassword",
		);
		expect(result).toEqual({
			id: 1,
			name: "Test User",
			email: "test@example.com",
		});
	});

	it("throws an error if email already exists", async () => {
		authRepository.findUserByEmail.mockResolvedValue({
			id: 1,
			email: "test@example.com",
		});

		await expect(
			authService.signUp("Test User", "test@example.com", "Password123!"),
		).rejects.toThrow("An account with this email already exists.");
	});
});

describe("authService.login", () => {
	it("logs in successfully with correct credentials", async () => {
		authRepository.findUserByEmail.mockResolvedValue({
			id: 1,
			email: "test@example.com",
			name: "Test User",
			hashed_password: "hashedpass",
		});
		bcrypt.compare.mockResolvedValue(true);

		const result = await authService.login("test@example.com", "Password123!");

		expect(authRepository.findUserByEmail).toHaveBeenCalledWith(
			"test@example.com",
		);
		expect(bcrypt.compare).toHaveBeenCalledWith("Password123!", "hashedpass");
		expect(result).toEqual({
			id: 1,
			email: "test@example.com",
			name: "Test User",
		});
	});

	it("throws an error if user does not exist", async () => {
		authRepository.findUserByEmail.mockResolvedValue(null);

		await expect(
			authService.login("missing@example.com", "Password123!"),
		).rejects.toThrow("Invalid credentials.");
	});

	it("throws an error if password is incorrect", async () => {
		authRepository.findUserByEmail.mockResolvedValue({
			id: 1,
			email: "test@example.com",
			name: "Test User",
			hashed_password: "hashedpass",
		});
		bcrypt.compare.mockResolvedValue(false);

		await expect(
			authService.login("test@example.com", "WrongPassword"),
		).rejects.toThrow("Invalid credentials.");
	});
});
