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
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
	const [collapsed, setCollapsed] = React.useState(false);
	const menuItems = [
		{ id: "dashboard", label: "Dashboard", icon: Home },
		{ id: "youtube", label: "YouTube Player", icon: Play },
		{ id: "quiz", label: "Quiz Bomber", icon: HelpCircle },
		{ id: "notes", label: "Sticky Notes", icon: StickyNote },
	];

	return (
		<UISidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
			<SidebarHeader>
				<div className="flex items-center justify-between">
					{!collapsed && <span className="font-semibold">Menu</span>}
					<button
						aria-label="Toggle"
						onClick={() => setCollapsed((v) => !v)}
						className="text-black"
					>
						<PanelsTopLeft className="w-4 h-4" />
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
						>
							<Icon className="w-5 h-5" />
							{!collapsed && <span className="font-medium">{item.label}</span>}
						</SidebarItem>
					);
				})}
			</SidebarContent>
			<SidebarFooter>
				<SidebarItem onClick={() => onTabChange("edit-plan")}>
					<Edit3 className="w-5 h-5" />
					{!collapsed && <span className="font-medium">Edit Plan</span>}
				</SidebarItem>
				<div className="mt-2" />
				<SidebarItem onClick={() => onTabChange("profile")}>
					<User className="w-5 h-5" />
					{!collapsed && <span className="font-medium">Profile</span>}
				</SidebarItem>
			</SidebarFooter>
		</UISidebar>
	);
};

export default Sidebar;
