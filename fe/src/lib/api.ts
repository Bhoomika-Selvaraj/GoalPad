import axios from "axios";
import {
	User,
	LoginCredentials,
	RegisterCredentials,
	AuthResponse,
	LearningGoal,
	RoadmapRequest,
	Task,
	TaskCreate,
	TaskUpdate,
	Schedule,
	ScheduleCreate,
	Note,
	NoteCreate,
	NoteUpdate,
	Playlist,
	PlaylistCreate,
	Progress,
	ProgressCreate,
	Quiz,
	QuizCreate,
	VideoSummaryRequest,
	VideoQuestionRequest,
	DashboardData,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add auth token to requests
api.interceptors.request.use((config) => {
	if (!config.headers) config.headers = {};
	const token =
		typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
	if (token) {
		(config.headers as any)["Authorization"] = `Bearer ${token}`;
	}
	return config;
});

// Handle auth errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status;
		if (status === 401 || status === 403) {
			if (typeof window !== "undefined") {
				localStorage.removeItem("access_token");
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	}
);

// Auth endpoints
export const authAPI = {
	register: (data: RegisterCredentials) =>
		api.post<User>("/auth/register", data),
	login: (data: LoginCredentials) =>
		api.post<AuthResponse>("/auth/login", data),
};

// AI endpoints
export const aiAPI = {
	generateRoadmap: (data: RoadmapRequest) =>
		api.post<LearningGoal>("/ai/generate-roadmap", data),
	generateQuiz: (data: QuizCreate) => api.post<Quiz>("/ai/generate-quiz", data),
	getVideoSummary: (data: VideoSummaryRequest) =>
		api.post<{ summary: string }>("/ai/video-summary", data),
	answerQuestion: (data: VideoQuestionRequest) =>
		api.post<{ answer: string }>("/ai/answer-question", data),
};

// Dashboard
export const dashboardAPI = {
	getDashboard: () => api.get<DashboardData>("/dashboard"),
};

// Tasks
export const tasksAPI = {
	getTasks: () => api.get<Task[]>("/tasks"),
	createTask: (data: TaskCreate) => api.post<Task>("/tasks", data),
	updateTask: (id: number, data: TaskUpdate) =>
		api.put<Task>(`/tasks/${id}`, data),
	deleteTask: (id: number) => api.delete<{ message: string }>(`/tasks/${id}`),
};

// Schedule
export const scheduleAPI = {
	getSchedule: () => api.get<Schedule[]>("/schedule"),
	createSchedule: (data: ScheduleCreate) =>
		api.post<Schedule>("/schedule", data),
};

// Notes
export const notesAPI = {
	getNotes: () => api.get<Note[]>("/notes"),
	createNote: (data: NoteCreate) => api.post<Note>("/notes", data),
	updateNote: (id: number, data: NoteUpdate) =>
		api.put<Note>(`/notes/${id}`, data),
	deleteNote: (id: number) => api.delete<{ message: string }>(`/notes/${id}`),
};

// Playlists
export const playlistsAPI = {
	getPlaylists: () => api.get<Playlist[]>("/playlists"),
	createPlaylist: (data: PlaylistCreate) =>
		api.post<Playlist>("/playlists", data),
};

// Progress
export const progressAPI = {
	createProgress: (data: ProgressCreate) =>
		api.post<Progress>("/progress", data),
};

// Profile
export const profileAPI = {
	getProfile: () => api.get<User>("/profile"),
	updateProfile: (data: Partial<User>) => api.put<User>("/profile", data),
	deleteAccount: () => api.delete<{ message: string }>("/profile"),
};

export default api;
