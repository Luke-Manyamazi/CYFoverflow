import bcrypt from "bcrypt";

import logger from "../utils/logger.js";

import * as repository from "./authRepository.js";

export async function signUp(name, email, password) {
	const existingUser = await repository.findUserByEmail(email);
	if (existingUser) {
		throw new Error("User already exists.");
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	logger.debug(`Password for ${email} hashed successfully.`);

	const newUser = await repository.createUser(name, email, hashedPassword);
	logger.info("New user created with ID: %s", email);
	return newUser;
}

export async function login(email, password) {
	const user = await repository.findUserByEmail(email);
	if (!user) {
		throw new Error("Invalid credentials.");
	}

	const match = await bcrypt.compare(password, user.hashed_password);
	if (!match) {
		throw new Error("Invalid credentials.");
	}

	const { hashed_password: _, ...userWithoutPassword } = user;
	logger.info("User logged in successfully: %s", email);
	return userWithoutPassword;
}
