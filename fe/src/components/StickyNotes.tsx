"use client";

import React, { useState, useEffect } from "react";
import { notesAPI } from "@/lib/api";
import { toast } from "react-hot-toast";
import {
	FiPlus,
	FiEdit2,
	FiTrash2,
	FiSave,
	FiExternalLink,
} from "react-icons/fi";
import { Note, NoteCreate, NoteUpdate } from "@/types";

const StickyNotes: React.FC = () => {
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingNote, setEditingNote] = useState<Note | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchNotes();
	}, []);

	const fetchNotes = async () => {
		try {
			const response = await notesAPI.getNotes();
			setNotes(response.data);
		} catch (_error: unknown) {
			console.error("Failed to fetch notes:", _error);
			toast.error("Failed to load notes");
		} finally {
			setLoading(false);
		}
	};

	const handleAddNote = async (data: NoteCreate) => {
		try {
			await notesAPI.createNote(data);
			fetchNotes();
			setShowAddModal(false);
			toast.success("Note added successfully!");
		} catch (_error: unknown) {
			toast.error("Failed to add note");
		}
	};

	const handleUpdateNote = async (id: number, data: NoteUpdate) => {
		try {
			await notesAPI.updateNote(id, data);
			fetchNotes();
			setEditingNote(null);
			toast.success("Note updated successfully!");
		} catch (_error: unknown) {
			toast.error("Failed to update note");
		}
	};

	const handleNoteSubmit = (data: NoteCreate | NoteUpdate) => {
		if (editingNote) {
			handleUpdateNote(editingNote.id, data as NoteUpdate);
		} else {
			handleAddNote(data as NoteCreate);
		}
	};

	const handleDeleteNote = async (id: number) => {
		if (window.confirm("Delete this note?")) {
			try {
				await notesAPI.deleteNote(id);
				fetchNotes();
				toast.success("Note deleted successfully!");
			} catch (_error: unknown) {
				toast.error("Failed to delete note");
			}
		}
	};

	const filteredNotes = notes.filter(
		(note) =>
			note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			note.content.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getNoteColor = (index: number) => {
		const colors = [
			"bg-yellow-100 border-yellow-300",
			"bg-pink-100 border-pink-300",
			"bg-blue-100 border-blue-300",
			"bg-green-100 border-green-300",
			"bg-purple-100 border-purple-300",
			"bg-orange-100 border-orange-300",
			"bg-cyan-100 border-cyan-300",
			"bg-rose-100 border-rose-300",
		];
		return colors[index % colors.length];
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Sticky Notes</h1>
					<p className="text-gray-600">
						Capture and organize your learning insights
					</p>
				</div>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
				>
					<FiPlus className="w-4 h-4" />
					<span>Add Note</span>
				</button>
			</div>

			<div className="relative">
				<input
					type="text"
					placeholder="Search notes..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				/>
				<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
					🔍
				</div>
			</div>

			{filteredNotes.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-6xl mb-4">📝</div>
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{searchTerm ? "No notes found" : "No notes yet"}
					</h3>
					<p className="text-gray-600 mb-4">
						{searchTerm
							? "Try adjusting your search terms"
							: "Start capturing your learning insights"}
					</p>
					{!searchTerm && (
						<button
							onClick={() => setShowAddModal(true)}
							className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
						>
							Create Your First Note
						</button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{filteredNotes.map((note, index) => {
						let created = "";
						try {
							created = note.created_at
								? new Date(note.created_at).toLocaleDateString()
								: "";
						} catch {}
						return (
							<div
								key={note.id}
								className={`${getNoteColor(
									index
								)} border-2 rounded-xl p-4 hover:shadow-md transition-shadow`}
							>
								<div className="flex justify-between items-start mb-2">
									<h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
										{note.title}
									</h3>
									<div className="flex space-x-1 ml-2">
										<button
											onClick={() => setEditingNote(note)}
											className="text-gray-600 hover:text-indigo-600"
										>
											<FiEdit2 className="w-3 h-3" />
										</button>
										<button
											onClick={() => handleDeleteNote(note.id)}
											className="text-gray-600 hover:text-red-600"
										>
											<FiTrash2 className="w-3 h-3" />
										</button>
									</div>
								</div>

								<p className="text-gray-700 text-sm mb-3 line-clamp-4">
									{note.content}
								</p>

								{note.source && (
									<div className="flex items-center justify-between text-xs text-gray-500">
										<span className="capitalize">{note.source}</span>
										{note.source_url && (
											<a
												href={note.source_url}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:text-indigo-600"
											>
												<FiExternalLink className="w-3 h-3" />
											</a>
										)}
									</div>
								)}

								{created && (
									<div className="text-xs text-gray-400 mt-2">{created}</div>
								)}
							</div>
						);
					})}
				</div>
			)}

			{(showAddModal || editingNote) && (
				<NoteModal
					isOpen={showAddModal || !!editingNote}
					onClose={() => {
						setShowAddModal(false);
						setEditingNote(null);
					}}
					onSubmit={handleNoteSubmit}
					editingNote={editingNote}
				/>
			)}
		</div>
	);
};

interface NoteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: NoteCreate | NoteUpdate) => void;
	editingNote?: Note | null;
}

const NoteModal: React.FC<NoteModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	editingNote,
}) => {
	const [formData, setFormData] = useState({
		title: "",
		content: "",
		source: "",
		source_url: "",
	});

	useEffect(() => {
		if (editingNote) {
			setFormData({
				title: editingNote.title,
				content: editingNote.content,
				source: editingNote.source || "",
				source_url: editingNote.source_url || "",
			});
		} else {
			setFormData({ title: "", content: "", source: "", source_url: "" });
		}
	}, [editingNote]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.title.trim() || !formData.content.trim()) {
			toast.error("Please fill in both title and content");
			return;
		}
		onSubmit({
			...formData,
			source: formData.source || undefined,
			source_url: formData.source_url || undefined,
		});
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
					{editingNote ? "Edit Note" : "Add New Note"}
				</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Title *
						</label>
						<input
							type="text"
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							placeholder="Enter note title"
							maxLength={100}
							required
						/>
						<p className="text-xs text-gray-500 mt-1">
							{formData.title.length}/100
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Content *
						</label>
						<textarea
							value={formData.content}
							onChange={(e) =>
								setFormData({ ...formData, content: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							placeholder="Enter note content"
							rows={4}
							maxLength={200}
							required
						/>
						<p className="text-xs text-gray-500 mt-1">
							{formData.content.length}/200
						</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Source (Optional)
						</label>
						<select
							value={formData.source}
							onChange={(e) =>
								setFormData({ ...formData, source: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
						>
							<option value="">Select source</option>
							<option value="youtube">YouTube Video</option>
							<option value="article">Article</option>
							<option value="book">Book</option>
							<option value="course">Course</option>
							<option value="manual">Manual Entry</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Source URL (Optional)
						</label>
						<input
							type="url"
							value={formData.source_url}
							onChange={(e) =>
								setFormData({ ...formData, source_url: e.target.value })
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
							placeholder="https://..."
						/>
					</div>

					<div className="flex space-x-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
						>
							<FiSave className="w-4 h-4 mr-2" />
							{editingNote ? "Update" : "Save"} Note
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default StickyNotes;
