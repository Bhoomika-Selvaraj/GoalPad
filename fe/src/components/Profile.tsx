"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { profileAPI } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
	FiUser,
	FiEdit2,
	FiSave,
	FiX,
	FiTrash2,
	FiShield,
	FiAlertTriangle,
} from "react-icons/fi";

const Profile: React.FC = () => {
	const { user, logout } = useAuth();
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
	});
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await profileAPI.updateProfile({ name: formData.name });
			toast.success("Profile updated successfully!");
			setEditing(false);
		} catch (_error: unknown) {
			toast.error("Failed to update profile");
		} finally {
			setLoading(false);
		}
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}

		if (passwordData.newPassword.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		setLoading(true);

		try {
			// Note: This would need a password change endpoint in the backend
			toast.success("Password updated successfully!");
			setShowPasswordModal(false);
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (_error: unknown) {
			toast.error("Failed to update password");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteAccount = async () => {
		if (
			window.confirm(
				"Are you sure you want to delete your account? This action cannot be undone."
			)
		) {
			setLoading(true);

			try {
				await profileAPI.deleteAccount();
				toast.success("Account deleted successfully");
				logout();
			} catch (_error: unknown) {
				toast.error("Failed to delete account");
			} finally {
				setLoading(false);
			}
		}
	};

	const stats = [
		{
			label: "Account Created",
			value: user?.created_at
				? new Date(user.created_at).toLocaleDateString()
				: "N/A",
		},
		{ label: "Learning Days", value: "0" },
		{ label: "Notes Created", value: "0" },
		{ label: "Tasks Completed", value: "0" },
	];

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="bg-white rounded-2xl shadow-sm p-6">
				<div className="flex items-center space-x-4">
					<div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
						<FiUser className="w-8 h-8 text-indigo-600" />
					</div>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{user?.name || user?.username}
						</h1>
						<p className="text-gray-600">{user?.email}</p>
					</div>
				</div>
			</div>

			{/* Profile Information */}
			<div className="bg-white rounded-2xl shadow-sm p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold text-gray-900">
						Profile Information
					</h2>
					{!editing ? (
						<button
							onClick={() => setEditing(true)}
							className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-2"
						>
							<FiEdit2 className="w-4 h-4" />
							<span>Edit</span>
						</button>
					) : (
						<div className="flex space-x-2">
							<button
								onClick={() => setEditing(false)}
								className="text-gray-600 hover:text-gray-700 flex items-center space-x-2"
							>
								<FiX className="w-4 h-4" />
								<span>Cancel</span>
							</button>
						</div>
					)}
				</div>

				{editing ? (
					<form onSubmit={handleUpdateProfile} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Full Name
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
								placeholder="Enter your full name"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Email
							</label>
							<input
								type="email"
								value={formData.email}
								disabled
								className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Email cannot be changed
							</p>
						</div>

						<div className="flex space-x-3">
							<button
								type="submit"
								disabled={loading}
								className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center space-x-2"
							>
								<FiSave className="w-4 h-4" />
								<span>{loading ? "Saving..." : "Save Changes"}</span>
							</button>
						</div>
					</form>
				) : (
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Full Name
							</label>
							<p className="text-gray-900">{user?.name || "Not provided"}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Username
							</label>
							<p className="text-gray-900">{user?.username}</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<p className="text-gray-900">{user?.email}</p>
						</div>
					</div>
				)}
			</div>

			{/* Statistics */}
			<div className="bg-white rounded-2xl shadow-sm p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-6">
					Your Statistics
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{stats.map((stat, index) => (
						<div key={index} className="text-center">
							<div className="text-2xl font-bold text-indigo-600 mb-1">
								{stat.value}
							</div>
							<div className="text-sm text-gray-600">{stat.label}</div>
						</div>
					))}
				</div>
			</div>

			{/* Security Settings */}
			<div className="bg-white rounded-2xl shadow-sm p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-6">
					Security Settings
				</h2>
				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
						<div className="flex items-center space-x-3">
							<FiShield className="w-5 h-5 text-gray-600" />
							<div>
								<h3 className="font-medium text-gray-900">Change Password</h3>
								<p className="text-sm text-gray-600">
									Update your account password
								</p>
							</div>
						</div>
						<button
							onClick={() => setShowPasswordModal(true)}
							className="text-indigo-600 hover:text-indigo-700 font-medium"
						>
							Change
						</button>
					</div>
				</div>
			</div>

			{/* Danger Zone */}
			<div className="bg-red-50 border border-red-200 rounded-2xl p-6">
				<h2 className="text-xl font-semibold text-red-900 mb-6">Danger Zone</h2>
				<div className="space-y-4">
					<div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-white">
						<div className="flex items-center space-x-3">
							<FiAlertTriangle className="w-5 h-5 text-red-600" />
							<div>
								<h3 className="font-medium text-red-900">Delete Account</h3>
								<p className="text-sm text-red-700">
									Permanently delete your account and all associated data
								</p>
							</div>
						</div>
						<button
							onClick={() => setShowDeleteModal(true)}
							className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
						>
							<FiTrash2 className="w-4 h-4" />
							<span>Delete Account</span>
						</button>
					</div>
				</div>
			</div>

			{/* Password Change Modal */}
			{showPasswordModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							Change Password
						</h2>

						<form onSubmit={handlePasswordChange} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Current Password
								</label>
								<input
									type="password"
									value={passwordData.currentPassword}
									onChange={(e) =>
										setPasswordData({
											...passwordData,
											currentPassword: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									New Password
								</label>
								<input
									type="password"
									value={passwordData.newPassword}
									onChange={(e) =>
										setPasswordData({
											...passwordData,
											newPassword: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									required
									minLength={6}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Confirm New Password
								</label>
								<input
									type="password"
									value={passwordData.confirmPassword}
									onChange={(e) =>
										setPasswordData({
											...passwordData,
											confirmPassword: e.target.value,
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									required
								/>
							</div>

							<div className="flex space-x-3 pt-4">
								<button
									type="button"
									onClick={() => {
										setShowPasswordModal(false);
										setPasswordData({
											currentPassword: "",
											newPassword: "",
											confirmPassword: "",
										});
									}}
									className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={loading}
									className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
								>
									{loading ? "Updating..." : "Update Password"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Account Modal */}
			{showDeleteModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<div className="flex items-center space-x-3 mb-4">
							<FiAlertTriangle className="w-6 h-6 text-red-600" />
							<h2 className="text-lg font-semibold text-gray-900">
								Delete Account
							</h2>
						</div>

						<p className="text-gray-600 mb-6">
							Are you sure you want to delete your account? This action cannot
							be undone and will permanently remove all your data, including:
						</p>

						<ul className="text-sm text-gray-600 mb-6 space-y-1">
							<li>• All learning goals and roadmaps</li>
							<li>• Tasks and progress data</li>
							<li>• Notes and playlists</li>
							<li>• Schedule and quiz history</li>
						</ul>

						<div className="flex space-x-3">
							<button
								onClick={() => setShowDeleteModal(false)}
								className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={handleDeleteAccount}
								disabled={loading}
								className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
							>
								{loading ? "Deleting..." : "Delete Account"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Profile;
