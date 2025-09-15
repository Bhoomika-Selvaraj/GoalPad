"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardAPI, tasksAPI } from "@/lib/api";
import Sidebar from "./Sidebar";
import OnboardingFlow from "./OnboardingFlow";
import LoadingSpinner from "./LoadingSpinner";
import YouTubePlayer from "./YouTubePlayer";
import QuizBomber from "./QuizBomber";
import StickyNotes from "./StickyNotes";
import Profile from "./Profile";
import { DashboardData, Task, RoadmapWeek } from "@/types";
import { Checkbox } from "./ui/checkbox";

const Dashboard: React.FC = () => {
	const { user, logout } = useAuth();
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("dashboard");
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
	const [toggling, setToggling] = useState<number | null>(null);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const response = await dashboardAPI.getDashboard();
			setDashboardData(response.data);
			if (!response.data.learning_goal) setShowOnboarding(true);
		} catch (error) {
			console.error("Failed to fetch dashboard data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleOnboardingComplete = () => {
		setShowOnboarding(false);
		fetchDashboardData();
	};

	const tasksByWeek: Record<number, Task[]> = useMemo(() => {
		const map: Record<number, Task[]> = {};
		(dashboardData?.recent_tasks || []).forEach((t) => {
			if (!t.week) return;
			map[t.week] = map[t.week] || [];
			map[t.week].push(t);
		});
		return map;
	}, [dashboardData?.recent_tasks]);

	const themesByWeek: Record<number, string> = useMemo(() => {
		const map: Record<number, string> = {};
		const weeks =
			(
				dashboardData?.learning_goal?.roadmap as
					| { weeks?: RoadmapWeek[] }
					| undefined
			)?.weeks || [];
		weeks.forEach((w: RoadmapWeek) => {
			if (typeof w?.week === "number") map[w.week] = w?.theme || "";
		});
		return map;
	}, [dashboardData?.learning_goal?.roadmap]);

	const videosByWeek: Record<number, string[]> = useMemo(() => {
		const map: Record<number, string[]> = {};
		const weeks =
			(
				dashboardData?.learning_goal?.roadmap as
					| { weeks?: RoadmapWeek[] }
					| undefined
			)?.weeks || [];
		weeks.forEach((w: RoadmapWeek) => {
			if (typeof w?.week === "number") map[w.week] = w?.videos || [];
		});
		return map;
	}, [dashboardData?.learning_goal?.roadmap]);

	const totals = useMemo(() => {
		const totalTasks = (dashboardData?.recent_tasks || []).length;
		const completed = (dashboardData?.recent_tasks || []).filter(
			(t) => t.completed
		).length;
		return { totalTasks, completed };
	}, [dashboardData?.recent_tasks]);

	if (loading) return <LoadingSpinner />;
	if (showOnboarding)
		return <OnboardingFlow onComplete={handleOnboardingComplete} />;

	const globalPct = totals.totalTasks
		? Math.round((totals.completed / totals.totalTasks) * 100)
		: 0;

	const closeModal = () => setSelectedWeek(null);

	const handleToggleTask = async (task: Task) => {
		const newCompleted = !task.completed;
		setToggling(task.id);
		setDashboardData((prev) => {
			if (!prev) return prev;
			const updated = prev.recent_tasks.map((t) =>
				t.id === task.id ? { ...t, completed: newCompleted } : t
			);
			return { ...prev, recent_tasks: updated };
		});
		try {
			await tasksAPI.updateTask(task.id, { completed: newCompleted });
		} catch (_err) {
			setDashboardData((prev) => {
				if (!prev) return prev;
				const updated = prev.recent_tasks.map((t) =>
					t.id === task.id ? { ...t, completed: task.completed } : t
				);
				return { ...prev, recent_tasks: updated };
			});
		} finally {
			setToggling(null);
		}
	};

	return (
		<div className="min-h-screen bg-white flex">
			{/* Sidebar controls left margin via collapse callback */}
			<Sidebar
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onCollapsedChange={(collapsed) => {
					const root = document.documentElement;
					root.style.setProperty("--sb-width", collapsed ? "3.5rem" : "14rem");
				}}
			/>

			<div className="flex-1" style={{ marginLeft: "var(--sb-width, 14rem)" }}>
				<div className="p-6">
					{activeTab === "dashboard" && (
						<>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<h1 className="text-2xl font-bold text-black">
										Welcome back, {user?.name || user?.username}!
									</h1>
									<button
										onClick={logout}
										className="px-3 py-1 text-black hover:underline"
									>
										Sign Out
									</button>
								</div>

								{/* Global Progress */}
								<div className="border border-black rounded-xl p-4">
									<div className="flex items-center justify-between mb-2">
										<h2 className="text-sm font-semibold text-black">
											Overall Progress
										</h2>
										<span className="text-xs text-black/60">
											{totals.completed}/{totals.totalTasks} tasks • {globalPct}
											%
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-black h-2 rounded-full transition-all"
											style={{ width: `${globalPct}%` }}
										/>
									</div>
								</div>

								{/* 24‑week grid */}
								<div className="border border-black rounded-xl p-4">
									<h2 className="text-sm font-semibold text-black mb-3">
										Your 24‑Week Plan
									</h2>
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
										{Array.from({ length: 24 }).map((_, idx) => {
											const week = idx + 1;
											const items = (tasksByWeek[week] || []).sort((a, b) =>
												a.title.localeCompare(b.title)
											);
											const done = items.filter((t) => t.completed).length;
											const total = items.length;
											const pct = total ? Math.round((done / total) * 100) : 0;
											const theme = themesByWeek[week] || "";
											return (
												<div
													key={week}
													className="rounded-xl border border-gray-200 p-4 bg-white hover:border-black transition cursor-pointer"
													onClick={() => setSelectedWeek(week)}
												>
													<div className="flex items-start justify-between mb-2">
														<div>
															<p className="text-xs text-black/60">
																Week {week}
															</p>
															<h3 className="text-sm font-semibold text-black line-clamp-2">
																{theme || "Theme"}
															</h3>
														</div>
														<div className="relative h-8 w-8">
															<svg viewBox="0 0 36 36" className="h-8 w-8">
																<path
																	d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
																	fill="none"
																	stroke="#e5e7eb"
																	strokeWidth="3"
																/>
																<path
																	d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
																	fill="none"
																	stroke="#000"
																	strokeWidth="3"
																	strokeDasharray={`${pct}, 100`}
																	strokeLinecap="round"
																/>
															</svg>
															<span className="absolute inset-0 flex items-center justify-center text-[10px]">
																{pct}%
															</span>
														</div>
													</div>
													<p className="text-xs text-black/60">
														Completed {done}/{total}
													</p>
												</div>
											);
										})}
									</div>
								</div>
							</div>

							{/* Week details modal */}
							{selectedWeek && (
								<div className="fixed inset-0 z-50 flex items-center justify-center">
									<div
										className="absolute inset-0 bg-black/40"
										onClick={closeModal}
									/>
									<div className="relative bg-white border border-black rounded-2xl w-full max-w-xl mx-4 p-4">
										<div className="flex items-center justify-between mb-3">
											<h3 className="text-base font-semibold text-black">
												Week {selectedWeek}: {themesByWeek[selectedWeek] || ""}
											</h3>
											<button
												className="text-sm text-black hover:underline"
												onClick={closeModal}
											>
												Close
											</button>
										</div>
										<div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
											{/* Tasks */}
											<div>
												<p className="text-xs font-semibold text-black mb-2">
													Checklist
												</p>
												<div className="space-y-2">
													{(tasksByWeek[selectedWeek] || []).map((t) => (
														<div key={t.id} className="flex items-start gap-2">
															<Checkbox
																checked={t.completed}
																onCheckedChange={() => handleToggleTask(t)}
																className="mt-0.5"
															/>
															<p
																className={
																	"text-sm text-black " +
																	(t.completed ? "line-through opacity-60" : "")
																}
															>
																{t.title}
															</p>
														</div>
													))}
													{(tasksByWeek[selectedWeek] || []).length === 0 && (
														<p className="text-xs text-black/60">
															No tasks for this week.
														</p>
													)}
												</div>
											</div>

											{/* Videos */}
											<div>
												<p className="text-xs font-semibold text-black mb-2">
													Curated videos
												</p>
												<ul className="list-disc pl-5 space-y-1">
													{(videosByWeek[selectedWeek] || [])
														.slice(0, 4)
														.map((url, i) => (
															<li key={i} className="text-sm">
																<a
																	href={url}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-black underline break-all"
																>
																	{url}
																</a>
															</li>
														))}
													{(videosByWeek[selectedWeek] || []).length === 0 && (
														<p className="text-xs text-black/60">
															No videos linked for this week.
														</p>
													)}
												</ul>
											</div>
										</div>
									</div>
								</div>
							)}
						</>
					)}

					{activeTab === "youtube" && <YouTubePlayer />}
					{activeTab === "quiz" && <QuizBomber />}
					{activeTab === "notes" && <StickyNotes />}
					{activeTab === "profile" && <Profile />}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
