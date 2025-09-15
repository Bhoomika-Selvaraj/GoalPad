// User types
export interface User {
	id: number;
	username: string;
	email: string;
	name?: string;
	created_at: string;
	updated_at?: string;
}

// Auth types
export interface LoginCredentials {
	username: string;
	password: string;
}

export interface RegisterCredentials {
	username: string;
	email: string;
	password: string;
	name?: string;
}

export interface AuthResponse {
	access_token: string;
	token_type: string;
}

// Learning Goal types
export interface LearningGoal {
	id: number;
	user_id: number;
	topic: string;
	details?: string;
	roadmap?: RoadmapData;
	created_at: string;
	updated_at?: string;
}

export interface RoadmapData {
	weeks: RoadmapWeek[];
}

export interface RoadmapWeek {
	week: number;
	theme: string;
	tasks: RoadmapTask[];
	videos?: string[];
}

export interface RoadmapTask {
	description: string;
}

// Task types
export interface Task {
	id: number;
	user_id: number;
	title: string;
	description?: string;
	week?: number;
	completed: boolean;
	due_date?: string;
	created_at: string;
	updated_at?: string;
}

export interface TaskCreate {
	title: string;
	description?: string;
	week?: number;
	completed?: boolean;
	due_date?: string;
}

export interface TaskUpdate {
	title?: string;
	description?: string;
	week?: number;
	completed?: boolean;
	due_date?: string;
}

// Schedule types
export interface Schedule {
	id: number;
	user_id: number;
	day_of_week: string;
	time_slot: string;
	task_id?: number;
	custom_task?: string;
	date?: string;
	created_at: string;
	updated_at?: string;
}

export interface ScheduleCreate {
	day_of_week: string;
	time_slot: string;
	task_id?: number;
	custom_task?: string;
	date?: string;
}

// Note types
export interface Note {
	id: number;
	user_id: number;
	title: string;
	content: string;
	source?: string;
	source_url?: string;
	created_at: string;
	updated_at?: string;
}

export interface NoteCreate {
	title: string;
	content: string;
	source?: string;
	source_url?: string;
}

export interface NoteUpdate {
	title?: string;
	content?: string;
	source?: string;
	source_url?: string;
}

// Playlist types
export interface Playlist {
	id: number;
	user_id: number;
	title: string;
	description?: string;
	youtube_playlist_id: string;
	thumbnail_url?: string;
	created_at: string;
	updated_at?: string;
}

export interface PlaylistCreate {
	title: string;
	description?: string;
	youtube_playlist_id: string;
	thumbnail_url?: string;
}

// Progress types
export interface Progress {
	id: number;
	user_id: number;
	date: string;
	tasks_completed: number;
	study_hours: number;
	notes_created: number;
	created_at: string;
}

export interface ProgressCreate {
	date: string;
	tasks_completed: number;
	study_hours: number;
	notes_created: number;
}

// Quiz types
export interface Quiz {
	id: number;
	user_id: number;
	topic: string;
	difficulty: string;
	questions: QuizQuestion[];
	created_at: string;
}

export interface QuizQuestion {
	question: string;
	options: string[];
	correct_answer: number;
}

export interface QuizCreate {
	topic: string;
	difficulty: string;
	week_start?: number;
	week_end?: number;
}

// AI types
export interface RoadmapRequest {
	topic: string;
	details: string;
}

export interface VideoSummaryRequest {
	video_title: string;
	video_description?: string;
}

export interface VideoQuestionRequest {
	question: string;
	video_context: string;
}

// Dashboard types
export interface DashboardData {
	user: User;
	learning_goal?: LearningGoal;
	recent_tasks: Task[];
	progress_data: Progress[];
	upcoming_schedule: Schedule[];
}

// API Response types
export interface ApiResponse<T> {
	data: T;
	message?: string;
}

// Form types
export interface AuthFormData {
	username: string;
	email: string;
	password: string;
	name?: string;
}

// Component prop types
export interface OnboardingStepProps {
	onNext: (data: Record<string, unknown>) => void;
	onBack?: () => void;
	data?: Record<string, unknown>;
}

export interface EisenhowerQuadrantProps {
	title: string;
	tasks: Task[];
	onTaskUpdate: (taskId: number, updates: Partial<Task>) => void;
	color: string;
	icon: React.ComponentType;
}

export interface TaskItemProps {
	task: Task;
	onUpdate: (updates: Partial<Task>) => void;
}

export interface CalendarDayProps {
	date: Date;
	isCurrentMonth: boolean;
	isToday: boolean;
	schedules: Schedule[];
	onScheduleClick: (schedule: Schedule) => void;
}

export interface NoteItemProps {
	note: Note;
	onUpdate: (updates: Partial<Note>) => void;
	onDelete: () => void;
}

export interface PlaylistItemProps {
	playlist: Playlist;
	onSelect: (playlist: Playlist) => void;
	onDelete: () => void;
}

export interface QuizQuestionProps {
	question: QuizQuestion;
	questionNumber: number;
	onAnswer: (answer: number) => void;
	selectedAnswer?: number;
	showResult?: boolean;
}
