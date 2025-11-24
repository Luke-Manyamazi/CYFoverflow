const API_BASE_URL = "/api";

export const login = async (email, password) => {
	const response = await fetch(`${API_BASE_URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ email, password }),
	});

	if (!response.ok) {
		const error = await response.json();
		// Handle validation errors (400) with details field
		const errorMessage = error.details || error.message || "Login failed";
		throw new Error(errorMessage);
	}

	return response.json();
};

export const signUp = async (name, email, password) => {
	const response = await fetch(`${API_BASE_URL}/auth/signup`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, email, password }),
	});

	if (!response.ok) {
		const error = await response.json();
		// Handle validation errors (400) with details field
		const errorMessage = error.details || error.message || "Sign up failed";
		throw new Error(errorMessage);
	}

	return response.json();
};
