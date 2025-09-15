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
		<div className="min-h-screen grid place-items-center px-4">
			<div className="w-full max-w-sm border border-neutral-200 rounded-2xl shadow-sm p-5 bg-white">
				<h1 className="text-xl font-semibold text-center mb-1">
					{isLogin ? "Welcome back" : "Create your account"}
				</h1>
				<p className="text-center text-black/60 mb-4 text-sm">
					{isLogin ? "Sign in to continue" : "It takes less than a minute"}
				</p>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
					{!isLogin && (
						<input
							{...register("name")}
							type="text"
							placeholder="Full name (optional)"
							className="w-full border border-neutral-300 rounded-lg px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-black"
						/>
					)}
					<input
						{...register("username", { required: "Username is required" })}
						type="text"
						placeholder="Username"
						className="w-full border border-neutral-300 rounded-lg px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-black"
					/>
					{!isLogin && (
						<input
							{...register("email", { required: "Email is required" })}
							type="email"
							placeholder="Email"
							className="w-full border border-neutral-300 rounded-lg px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-black"
						/>
					)}
					<input
						{...register("password", { required: "Password is required" })}
						type="password"
						placeholder="Password"
						className="w-full border border-neutral-300 rounded-lg px-3 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-black"
					/>

					<button
						type="submit"
						className="w-full bg-black text-white rounded-lg h-9 text-sm"
					>
						{isLogin ? "Sign in" : "Sign up"}
					</button>
				</form>

				<div className="text-center mt-3">
					<button
						onClick={() => {
							setIsLogin(!isLogin);
							reset();
						}}
						className="underline text-sm"
					>
						{isLogin
							? "Don't have an account? Sign up"
							: "Already have an account? Sign in"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
