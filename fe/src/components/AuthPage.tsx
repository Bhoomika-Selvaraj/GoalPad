"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { AuthFormData } from "@/types";

const AuthPage: React.FC = () => {
	const [isLogin, setIsLogin] = useState(true);
	const { login, register: registerUser } = useAuth();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<AuthFormData>();

	const onSubmit = async (data: AuthFormData) => {
		try {
			if (isLogin) {
				await login(data.username, data.password);
				toast.success("Welcome back!");
			} else {
				await registerUser(data.username, data.email, data.password, data.name);
				toast.success("Account created");
			}
		} catch (error) {
			toast.error("Authentication failed");
		}
	};

	return (
		<div className="min-h-screen grid place-items-center">
			<div className="w-full max-w-md">
				<h1 className="text-3xl font-bold text-center mb-2">
					{isLogin ? "Login to your account" : "Create an account"}
				</h1>
				<p className="text-center text-black/60 mb-6">
					Enter your {isLogin ? "credentials" : "details"} below
				</p>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{!isLogin && (
						<input
							{...register("name")}
							type="text"
							placeholder="Full name (optional)"
							className="w-full border border-black rounded-lg px-3 py-2"
						/>
					)}
					<input
						{...register("username", { required: "Username is required" })}
						type="text"
						placeholder="m@example.com"
						className="w-full border border-black rounded-lg px-3 py-2"
					/>
					{!isLogin && (
						<input
							{...register("email", { required: "Email is required" })}
							type="email"
							placeholder="Email"
							className="w-full border border-black rounded-lg px-3 py-2"
						/>
					)}
					<input
						{...register("password", { required: "Password is required" })}
						type="password"
						placeholder="Password"
						className="w-full border border-black rounded-lg px-3 py-2"
					/>

					<button
						type="submit"
						className="w-full bg-black text-white rounded-lg py-2"
					>
						{isLogin ? "Login" : "Sign up"}
					</button>
				</form>

				<div className="text-center mt-4">
					<button
						onClick={() => {
							setIsLogin(!isLogin);
							reset();
						}}
						className="underline"
					>
						{isLogin
							? "Don't have an account? Sign up"
							: "Already have an account? Login"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
