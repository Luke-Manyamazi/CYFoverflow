import { Router } from "express";

import { registerUser, loginUser } from "./messages/auth.js";
import messageRouter from "./messages/messageRouter.js";

// Import the authentication functions from the service file

const api = Router();

// --- Existing Route ---
api.use("/message", messageRouter);

// --- New Authentication Routes ---

// POST /register (Sign Up)
api.post("/register", async (req, res) => {
	// We now extract name, email, and password from the request body
	const { name, email, password } = req.body;

	// Validation check includes 'name'
	if (!name || !email || !password || password.length < 6) {
		return res.status(400).send({
			message: "Name, valid email, and password (min 6 chars) are required.",
		});
	}

	try {
		// Call the service function, passing all three fields
		const newUser = await registerUser(name, email, password);

		return res.status(201).send({
			message: "User created successfully.",
			user: newUser, // newUser already contains id, name, and email
		});
	} catch (error) {
		if (error.message === "User already exists.") {
			return res
				.status(409)
				.send({ message: "This email is already registered." });
		}

		return res.status(500).send({ message: "Internal server error." });
	}
});

// POST /login (Sign In)
api.post("/login", async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.send({ message: "Email and password are required." });
	}

	try {
		const { token, user } = await loginUser(email, password);

		return res.status(200).send({
			token: token,
			user: user, // user contains id, name, and email
		});
	} catch (error) {
		if (error.message === "Invalid credentials.") {
			// Sends generic error for security
			return res.status(401).send({ message: "Invalid email or password." });
		}

		return res.status(500).send({ message: "Internal server error." });
	}
});

export default api;
