import { useState } from "react";

import * as api from "../services/api";

import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [user, setUser] = useState(null);

	const login = async (email, password) => {
		const response = await api.login(email, password);
		const { user: userData } = response;
		setUser(userData);
		setIsLoggedIn(true);
		return response;
	};

	const signUp = async (name, email, password) => {
		const response = await api.signUp(name, email, password);
		const { newUser: userData } = response;
		setUser(userData);
		setIsLoggedIn(true);
		return response;
	};

	const logout = () => {
		setUser(null);
		setIsLoggedIn(false);
	};

	const value = {
		login,
		signUp,
		logout,
		isLoggedIn,
		user,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
