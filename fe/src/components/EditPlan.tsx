"use client";

import React, { useEffect, useState } from "react";
import { aiAPI, dashboardAPI } from "@/lib/api";
import { DashboardData } from "@/types";
import { toast } from "react-hot-toast";

interface EditPlanProps {
	onSaved: () => void;
}

const EditPlan: React.FC<EditPlanProps> = ({ onSaved }) => {
	const [loading, setLoading] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);
	const [topic, setTopic] = useState("");
	const [details, setDetails] = useState("");

	useEffect(() => {
		const load = async () => {
			try {
				const res = await dashboardAPI.getDashboard();
				const lg = res.data.learning_goal as DashboardData["learning_goal"];
				if (lg) {
					setTopic(lg.topic || "");
					setDetails(lg.details || "");
				}
			} catch (_e) {
				// ignore
			} finally {
				setInitialLoading(false);
			}
		};
		load();
	}, []);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!topic.trim()) {
			toast.error("Please enter a topic");
			return;
		}
		setLoading(true);
		try {
			await aiAPI.generateRoadmap({ topic, details });
			toast.success("Plan updated!");
			onSaved();
		} catch (_e) {
			toast.error("Failed to update plan");
		} finally {
			setLoading(false);
		}
	};

	if (initialLoading) {
		return (
			<div className="p-6">
				<p className="text-sm text-black/60">Loading current plan…</p>
			</div>
		);
	}

	return (
		<div className="max-w-2xl">
			<h2 className="text-xl font-semibold text-black mb-4">Edit Plan</h2>
			<form onSubmit={handleSave} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-black mb-1">
						Topic
					</label>
					<input
						type="text"
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
						className="w-full border border-black rounded-lg px-3 py-2"
						placeholder="e.g., Full‑stack Python with Django"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-black mb-1">
						Additional details (optional)
					</label>
					<textarea
						value={details}
						onChange={(e) => setDetails(e.target.value)}
						className="w-full border border-black rounded-lg px-3 py-2 h-28"
						placeholder="Any constraints, timeline notes, or preferences"
					/>
				</div>
				<div className="flex gap-2">
					<button
						type="submit"
						disabled={loading}
						className="px-4 py-2 rounded-lg border border-black bg-black text-white disabled:opacity-60"
					>
						{loading ? "Saving…" : "Save Changes"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditPlan;
