"use client";

import React from "react";
import {
	Home,
	Play,
	HelpCircle,
	StickyNote,
	User,
	Edit3,
	PanelsTopLeft,
} from "lucide-react";
import {
	Sidebar as UISidebar,
	SidebarHeader,
	SidebarContent,
	SidebarItem,
	SidebarFooter,
} from "./ui/sidebar";

interface SidebarProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
	onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
	activeTab,
	onTabChange,
	onCollapsedChange,
}) => {
	const [collapsed, setCollapsed] = React.useState(false);
	const menuItems = [
		{ id: "dashboard", label: "Dashboard", icon: Home },
		{ id: "youtube", label: "YouTube Player", icon: Play },
		{ id: "quiz", label: "Quiz Bomber", icon: HelpCircle },
		{ id: "notes", label: "Sticky Notes", icon: StickyNote },
	];

	return (
		<UISidebar
			collapsed={collapsed}
			onCollapsedChange={(v) => {
				setCollapsed(v);
				onCollapsedChange?.(v);
			}}
		>
			<SidebarHeader>
				<div className="flex items-center justify-between">
					{!collapsed && (
						<span className="font-semibold text-sm">Goal Pad</span>
					)}
					<button
						aria-label="Toggle"
						onClick={() => setCollapsed((v) => !v)}
						className="text-black"
					>
						<PanelsTopLeft className="w-3.5 h-3.5" />
					</button>
				</div>
			</SidebarHeader>
			<SidebarContent>
				{menuItems.map((item) => {
					const Icon = item.icon;
					const isActive = activeTab === item.id;
					return (
						<SidebarItem
							key={item.id}
							active={isActive}
							onClick={() => onTabChange(item.id)}
							className={
								collapsed
									? "justify-center gap-0 px-0 py-2"
									: "gap-2 px-2.5 py-2"
							}
						>
							{collapsed && <Icon className="w-4 h-4" />}
							{!collapsed && <span className="font-normal">{item.label}</span>}
						</SidebarItem>
					);
				})}
			</SidebarContent>
			<SidebarFooter>
				<SidebarItem
					onClick={() => onTabChange("edit-plan")}
					className={
						collapsed ? "justify-center gap-0 px-0 py-2.5" : "gap-2 px-2.5 py-2"
					}
				>
					{collapsed && <Edit3 className="w-4 h-4" />}
					{!collapsed && <span className="font-small">Edit Plan</span>}
				</SidebarItem>
				<div className="mt-2" />
				<SidebarItem
					onClick={() => onTabChange("profile")}
					className={
						collapsed ? "justify-center gap-0 px-0 py-2.5" : "gap-2 px-2.5 py-2"
					}
				>
					{collapsed && <User className="w-4 h-4" />}
					{!collapsed && <span className="font-small">Profile</span>}
				</SidebarItem>
			</SidebarFooter>
		</UISidebar>
	);
};

export default Sidebar;
