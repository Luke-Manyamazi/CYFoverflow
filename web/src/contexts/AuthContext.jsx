import { useState, useMemo } from "react";

import * as api from "../services/api";

import { AuthContext } from "./authContext";

const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
	const authData = (() => {
		try {
			return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
		} catch {
			return null;
		}
	})();
	const [isLoggedIn, setIsLoggedIn] = useState(!!authData);
	const [user, setUser] = useState(authData?.user);
	const [token, setToken] = useState(authData?.token);

	const login = async (email, password) => {
		const response = await api.login(email, password);
		const { user: userData, token: tokenData } = response;

		setUser(userData);
		setToken(tokenData);
		setIsLoggedIn(true);

		localStorage.setItem(
			TOKEN_KEY,
			JSON.stringify({ token: tokenData, user: userData }),
		);

		return response;
	};

	const signUp = async (name, email, password) => {
		const response = await api.signUp(name, email, password);
		const { newUser: userData, token: tokenData } = response;

		setUser(userData);
		setToken(tokenData);
		setIsLoggedIn(true);

		localStorage.setItem(
			TOKEN_KEY,
			JSON.stringify({ token: tokenData, user: userData }),
		);

		return response;
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		setIsLoggedIn(false);

		localStorage.removeItem(TOKEN_KEY);
	};

	const value = useMemo(
		() => ({
			login,
			signUp,
			logout,
			isLoggedIn,
			user,
			token,
		}),
		[isLoggedIn, user, token],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
