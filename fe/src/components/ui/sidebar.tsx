"use client";

import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "./utils";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	collapsed?: boolean;
	onCollapsedChange?: (v: boolean) => void;
}

export function Sidebar({
	collapsed,
	onCollapsedChange,
	className,
	children,
	...props
}: SidebarProps) {
	const [open, setOpen] = React.useState(!collapsed);
	React.useEffect(() => {
		if (collapsed !== undefined) setOpen(!collapsed);
	}, [collapsed]);

	return (
		<Collapsible.Root
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				onCollapsedChange?.(!v);
			}}
		>
			<div
				className={cn(
					"fixed left-0 top-0 h-full z-10 border-r border-neutral-200 bg-white transition-all flex flex-col",
					open ? "w-56" : "w-14",
					className
				)}
				{...props}
			>
				{children}
			</div>
		</Collapsible.Root>
	);
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
	return <div className="p-4 border-b border-gray-200">{children}</div>;
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
	return (
		<div className="p-2.5 space-y-1.5 flex-1 overflow-y-auto">{children}</div>
	);
}

export function SidebarItem({
	active,
	children,
	onClick,
	className,
}: {
	active?: boolean;
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				"w-full flex items-center rounded-lg text-left",
				active
					? "bg-neutral-200 text-neutral-900"
					: "text-neutral-900 hover:bg-neutral-100",
				className
			)}
		>
			{children}
		</button>
	);
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
	return <div className="mt-auto p-3 border-t border-gray-200">{children}</div>;
}
