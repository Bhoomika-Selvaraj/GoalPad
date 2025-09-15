"use client";

import React from "react";
import {
	format,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameDay,
} from "date-fns";

interface ProgressData {
	id: number;
	date: string;
	tasks_completed: number;
	study_hours: number;
	notes_created: number;
}

interface ProgressTrackerProps {
	progressData: ProgressData[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progressData }) => {
	const today = new Date();
	const startOfCurrentMonth = startOfMonth(today);
	const endOfCurrentMonth = endOfMonth(today);
	const daysInMonth = eachDayOfInterval({
		start: startOfCurrentMonth,
		end: endOfCurrentMonth,
	});

	const getProgressForDate = (date: Date) => {
		return progressData.find((progress) =>
			isSameDay(new Date(progress.date), date)
		);
	};

	const getIntensityColor = (progress: ProgressData | undefined) => {
		if (!progress) return "bg-gray-100";

		const totalActivity =
			progress.tasks_completed + progress.study_hours + progress.notes_created;

		if (totalActivity === 0) return "bg-gray-100";
		if (totalActivity <= 2) return "bg-green-200";
		if (totalActivity <= 5) return "bg-green-300";
		if (totalActivity <= 8) return "bg-green-400";
		return "bg-green-500";
	};

	const totalTasksCompleted = progressData.reduce(
		(sum, progress) => sum + progress.tasks_completed,
		0
	);
	const totalStudyHours = progressData.reduce(
		(sum, progress) => sum + progress.study_hours,
		0
	);
	const totalNotesCreated = progressData.reduce(
		(sum, progress) => sum + progress.notes_created,
		0
	);

	return (
		<div className="space-y-6">
			{/* Stats Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-blue-50 rounded-lg p-4">
					<div className="flex items-center">
						<div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
							<span className="text-white text-sm font-bold">✓</span>
						</div>
						<div>
							<p className="text-sm text-gray-600">Tasks Completed</p>
							<p className="text-2xl font-bold text-blue-700">
								{totalTasksCompleted}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-green-50 rounded-lg p-4">
					<div className="flex items-center">
						<div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
							<span className="text-white text-sm font-bold">⏱</span>
						</div>
						<div>
							<p className="text-sm text-gray-600">Study Hours</p>
							<p className="text-2xl font-bold text-green-700">
								{totalStudyHours}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-purple-50 rounded-lg p-4">
					<div className="flex items-center">
						<div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
							<span className="text-white text-sm font-bold">📝</span>
						</div>
						<div>
							<p className="text-sm text-gray-600">Notes Created</p>
							<p className="text-2xl font-bold text-purple-700">
								{totalNotesCreated}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Calendar Grid */}
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Activity Calendar - {format(today, "MMMM yyyy")}
				</h3>

				<div className="bg-white rounded-lg border border-gray-200 p-4">
					{/* Calendar Header */}
					<div className="grid grid-cols-7 gap-1 mb-2">
						{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
							<div
								key={day}
								className="text-center text-sm font-medium text-gray-500 py-2"
							>
								{day}
							</div>
						))}
					</div>

					{/* Calendar Grid */}
					<div className="grid grid-cols-7 gap-1">
						{daysInMonth.map((day, index) => {
							const progress = getProgressForDate(day);
							const isToday = isSameDay(day, today);
							const isCurrentMonth = day.getMonth() === today.getMonth();

							return (
								<div
									key={index}
									className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${
										isCurrentMonth ? getIntensityColor(progress) : "bg-gray-50"
									} ${isToday ? "ring-2 ring-indigo-500" : ""}`}
								>
									<span
										className={`text-xs ${
											isCurrentMonth ? "text-gray-700" : "text-gray-400"
										}`}
									>
										{format(day, "d")}
									</span>

									{progress && progress.tasks_completed > 0 && (
										<div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></div>
									)}
								</div>
							);
						})}
					</div>

					{/* Legend */}
					<div className="flex items-center justify-center mt-4 space-x-6 text-xs text-gray-500">
						<div className="flex items-center">
							<div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
							<span>No activity</span>
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-green-200 rounded mr-2"></div>
							<span>Light activity</span>
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
							<span>Moderate activity</span>
						</div>
						<div className="flex items-center">
							<div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
							<span>High activity</span>
						</div>
					</div>
				</div>
			</div>

			{/* 180-day Progress Bar */}
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					6-Month Progress
				</h3>
				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-gray-600">
							Learning Journey Progress
						</span>
						<span className="text-sm font-medium text-gray-900">
							0 / 180 days
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-3">
						<div
							className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
							style={{ width: "0%" }}
						></div>
					</div>
					<p className="text-xs text-gray-500 mt-2">
						Track your daily progress to build consistent learning habits
					</p>
				</div>
			</div>
		</div>
	);
};

export default ProgressTracker;
