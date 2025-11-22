import jwt from "jsonwebtoken";

import * as authRepository from "../auth/authRepository.js";

import config from "./config.js";

export function generateToken(userId) {
	return jwt.sign({ userId }, config.jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token) {
	try {
		return jwt.verify(token, config.jwtSecret);
	} catch {
		return null;
	}
}

export function authenticateToken() {
	return async (req, res, next) => {
		const token = req.headers.authorization?.split(" ")[1];
		if (!token) {
			return res.status(401).json({ message: "No token provided." });
		}

		const decoded = verifyToken(token);
		if (!decoded) {
			return res.status(401).json({ message: "Invalid token." });
		}

		const user = await authRepository.findUserById(decoded.userId);
		if (!user) {
			return res.status(401).json({ message: "User not found." });
		}

		req.user = user;
		next();
	};
}
