"use client";

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";
import { authAPI, profileAPI } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<void>;
	register: (
		username: string,
		email: string,
		password: string,
		name?: string
	) => Promise<void>;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("access_token");
		if (token) {
			// Verify token and get user data
			profileAPI
				.getProfile()
				.then((response) => {
					setUser(response.data);
					setLoading(false);
				})
				.catch(() => {
					localStorage.removeItem("access_token");
					setLoading(false);
				});
		} else {
			setLoading(false);
		}
	}, []);

	const login = async (username: string, password: string) => {
		try {
			const response = await authAPI.login({ username, password });
			const { access_token } = response.data;
			localStorage.setItem("access_token", access_token);

			// Get user profile
			const profileResponse = await profileAPI.getProfile();
			setUser(profileResponse.data);
		} catch (error) {
			throw error;
		}
	};

	const register = async (
		username: string,
		email: string,
		password: string,
		name?: string
	) => {
		try {
			const response = await authAPI.register({
				username,
				email,
				password,
				name,
			});
			setUser(response.data);
		} catch (error) {
			throw error;
		}
	};

	const logout = () => {
		localStorage.removeItem("access_token");
		setUser(null);
	};

	const value = {
		user,
		login,
		register,
		logout,
		loading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
