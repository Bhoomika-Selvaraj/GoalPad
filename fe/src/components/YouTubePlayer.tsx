"use client";

import React, { useMemo } from "react";
import { dashboardAPI } from "@/lib/api";
import LoadingSpinner from "./LoadingSpinner";

interface WeekLinks {
	week: number;
	title: string;
	links: string[];
}

const YouTubePlayer: React.FC = () => {
	const [loading, setLoading] = React.useState(true);
	const [weeks, setWeeks] = React.useState<WeekLinks[]>([]);

	React.useEffect(() => {
		const load = async () => {
			try {
				const res = await dashboardAPI.getDashboard();
				const roadmap = res.data.learning_goal?.roadmap as any;
				const items: WeekLinks[] = (roadmap?.weeks || []).map((w: any) => ({
					week: w.week,
					title: w.theme || `Week ${w.week}`,
					links: (w.videos || []).slice(0, 4),
				}));
				setWeeks(items);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="bg-white border border-black rounded-2xl p-6">
			<h2 className="text-xl font-semibold text-black mb-4">
				Weekly YouTube Links
			</h2>
			<div className="space-y-4">
				{weeks.length === 0 && (
					<p className="text-sm text-black/60">
						No links available yet. Generate a roadmap first.
					</p>
				)}
				{weeks.map((w) => (
					<div key={w.week} className="border border-gray-200 rounded-lg p-3">
						<div className="flex items-center justify-between mb-2">
							<h3 className="font-semibold text-black">
								Week {w.week} — {w.title}
							</h3>
							<span className="text-xs text-black/60">
								{w.links.length} links
							</span>
						</div>
						<ul className="list-disc pl-5 space-y-1">
							{w.links.length === 0 && (
								<li className="text-sm text-black/40">No videos suggested</li>
							)}
							{w.links.map((url, idx) => (
								<li key={idx} className="text-sm">
									<a
										href={url}
										target="_blank"
										rel="noreferrer"
										className="underline"
									>
										{url}
									</a>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
};

export default YouTubePlayer;
