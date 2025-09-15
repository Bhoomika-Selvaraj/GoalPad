"use client";

import * as React from "react";
import { cn } from "./utils";

export interface CheckboxProps {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	className?: string;
	"aria-label"?: string;
}

export function Checkbox({
	checked = false,
	onCheckedChange,
	className,
	...props
}: CheckboxProps) {
	return (
		<label
			className={cn(
				"inline-flex items-center cursor-pointer select-none",
				className
			)}
			{...props}
		>
			<input
				type="checkbox"
				className="sr-only"
				checked={checked}
				onChange={(e) => onCheckedChange?.(e.target.checked)}
				aria-checked={checked}
			/>
			<span
				className={cn(
					"h-4 w-4 rounded border border-black flex items-center justify-center transition-colors",
					checked ? "bg-black" : "bg-white"
				)}
			>
				{checked && (
					<svg
						viewBox="0 0 24 24"
						className="h-3 w-3 text-white"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M20 6L9 17l-5-5" />
					</svg>
				)}
			</span>
		</label>
	);
}

export default Checkbox;
