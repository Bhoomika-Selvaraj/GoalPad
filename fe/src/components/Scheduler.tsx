"use client";

import React, { useState, useEffect } from "react";
import { dashboardAPI } from "@/lib/api";
import { DashboardData, Task } from "@/types";

const Scheduler: React.FC = () => {
	const [dashboard, setDashboard] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetch = async () => {
			try {
				const res = await dashboardAPI.getDashboard();
				setDashboard(res.data);
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
			</div>
		);
	}

	const tasksByWeek: Record<number, Task[]> = {};
	(dashboard?.recent_tasks || []).forEach((t) => {
		if (!t.week) return;
		tasksByWeek[t.week] = tasksByWeek[t.week] || [];
		tasksByWeek[t.week].push(t);
	});

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold text-black">24‑Week Plan</h1>
			<p className="text-black/60">
				List view generated from your saved roadmap.
			</p>
			<div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden bg-white">
				{Array.from({ length: 24 }).map((_, idx) => {
					const week = idx + 1;
					const items = (tasksByWeek[week] || []).sort((a, b) =>
						a.quadrant.localeCompare(b.quadrant)
					);
					return (
						<div key={week} className="p-4">
							<div className="flex items-center justify-between mb-2">
								<h2 className="font-semibold text-black">Week {week}</h2>
								<span className="text-xs text-black/50">
									{items.length} tasks
								</span>
							</div>
							<ul className="space-y-1">
								{items.length === 0 && (
									<li className="text-sm text-black/40">No tasks generated</li>
								)}
								{items.map((t) => (
									<li
										key={t.id}
										className="text-sm text-black flex items-start gap-2"
									>
										<span className="text-xs px-1.5 py-0.5 border border-black rounded">
											{t.quadrant}
										</span>
										<span>{t.title}</span>
									</li>
								))}
							</ul>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Scheduler;
