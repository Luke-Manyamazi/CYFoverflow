import { useState } from "react";
import { AuthContext } from "./authContext";
import * as api from "../services/api";

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const userData = await api.login(email, password);
    setUser(userData);
    setIsLoggedIn(true);
    return userData;
  };

  const signUp = async (name, email, password) => {
    const userData = await api.signUp(name, email, password);
    setUser(userData);
    setIsLoggedIn(true);
    return userData;
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
