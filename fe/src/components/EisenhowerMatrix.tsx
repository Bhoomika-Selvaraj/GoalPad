"use client";

import React from "react";
import { Task } from "@/types";

interface Props {
	tasks: Task[];
}

const Quadrant = ({
	title,
	color,
	children,
}: {
	title: string;
	color: string;
	children: React.ReactNode;
}) => (
	<div className={`border rounded-lg p-3 ${color}`}>
		<h3 className="text-sm font-semibold mb-2">{title}</h3>
		<div className="space-y-2">{children}</div>
	</div>
);

const Card = ({ task }: { task: Task }) => (
	<div className="bg-white border rounded-md p-2 text-sm flex items-center justify-between">
		<span className="truncate">
			<span className="text-xs mr-2 border rounded px-1">{task.quadrant}</span>
			{task.title}
		</span>
	</div>
);

const EisenhowerMatrix: React.FC<Props> = ({ tasks }) => {
	const byQ = (q: string) => tasks.filter((t) => t.quadrant === q);
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
			<Quadrant title="Urgent & Important" color="bg-red-50">
				{byQ("Q1")
					.slice(0, 6)
					.map((t) => (
						<Card key={t.id} task={t} />
					))}
			</Quadrant>
			<Quadrant title="Not Urgent & Important" color="bg-yellow-50">
				{byQ("Q2")
					.slice(0, 6)
					.map((t) => (
						<Card key={t.id} task={t} />
					))}
			</Quadrant>
			<Quadrant title="Urgent & Not Important" color="bg-blue-50">
				{byQ("Q3")
					.slice(0, 6)
					.map((t) => (
						<Card key={t.id} task={t} />
					))}
			</Quadrant>
			<Quadrant title="Not Urgent & Not Important" color="bg-gray-50">
				{byQ("Q4")
					.slice(0, 6)
					.map((t) => (
						<Card key={t.id} task={t} />
					))}
			</Quadrant>
		</div>
	);
};

export default EisenhowerMatrix;
