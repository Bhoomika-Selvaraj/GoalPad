"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { aiAPI } from "@/lib/api";
import { toast } from "react-hot-toast";

interface OnboardingFlowProps {
	onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
	const [loading, setLoading] = useState(false);
	const { register, handleSubmit } = useForm<{ topic: string }>();

	const onSubmit = async ({ topic }: { topic: string }) => {
		setLoading(true);
		try {
			await aiAPI.generateRoadmap({ topic, details: "" });
			toast.success("Roadmap generated");
			onComplete();
		} catch (err: any) {
			toast.error(err?.response?.data?.detail || "Generate roadmap failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-[70vh] grid place-items-center">
			<div className="w-full max-w-xl border border-black rounded-2xl p-5">
				<h2 className="text-xl font-semibold mb-2">
					What topic do you want to learn in 6 months?
				</h2>
				<p className="text-sm text-black/60 mb-4">
					We’ll generate a structured 24‑week plan.
				</p>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
					<input
						{...register("topic", { required: "Enter a topic" })}
						placeholder="e.g., Production FastAPI and PostgreSQL"
						className="w-full border border-black rounded-lg px-3 py-2"
					/>
					<div className="flex justify-end">
						<button
							type="submit"
							disabled={loading}
							className="bg-black text-white px-4 py-2 rounded-lg"
						>
							{loading ? "Generating…" : "Generate Roadmap"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default OnboardingFlow;
