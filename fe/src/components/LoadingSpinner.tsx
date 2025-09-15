"use client";

import React from "react";

const LoadingSpinner: React.FC = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="text-center">
				<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
				<h2 className="text-xl font-semibold text-gray-700">
					Loading GoalPad...
				</h2>
				<p className="text-gray-500 mt-2">
					Setting up your productivity workspace
				</p>
			</div>
		</div>
	);
};

export default LoadingSpinner;
