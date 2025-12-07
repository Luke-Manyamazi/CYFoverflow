import bcrypt from "bcrypt";

import logger from "../utils/logger.js";

import * as repository from "./authRepository.js";

export async function signUp(name, email, password) {
	const normalizedEmail = email.toLowerCase().trim();
	const normalizedName = name.trim();

	const existingUser = await repository.findUserByEmail(normalizedEmail);
	if (existingUser) {
		throw new Error("An account with this email already exists.");
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	logger.debug(`Password for ${normalizedEmail} hashed successfully.`);

	const newUser = await repository.createUser(
		normalizedName,
		normalizedEmail,
		hashedPassword,
	);
	logger.info("New user created with ID: %s", normalizedEmail);
	return newUser;
}

export async function login(email, password) {
	const normalizedEmail = email.toLowerCase().trim();

	const user = await repository.findUserByEmail(normalizedEmail);
	if (!user) {
		throw new Error("Invalid credentials.");
	}

	const match = await bcrypt.compare(password, user.hashed_password);
	if (!match) {
		throw new Error("Invalid credentials.");
	}

	const { hashed_password: _, ...userWithoutPassword } = user;
	logger.info("User logged in successfully: %s", normalizedEmail);
	return userWithoutPassword;
}
