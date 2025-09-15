from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date


# Auth
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    name: Optional[str] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# Roadmap / Tasks
class TaskItem(BaseModel):
    description: str


class RoadmapWeek(BaseModel):
    week: int
    theme: str
    tasks: List[TaskItem]
    videos: List[str] = []


class LearningRoadmap(BaseModel):
    weeks: List[RoadmapWeek]


class RoadmapRequest(BaseModel):
    topic: str
    details: Optional[str] = ""


class LearningGoalCreate(BaseModel):
    topic: str
    details: Optional[str] = None
    roadmap: Optional[LearningRoadmap] = None


class LearningGoalResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    details: Optional[str]
    roadmap: Optional[dict]

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    week: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    week: Optional[int] = None
    completed: bool

    class Config:
        from_attributes = True


# Schedule
class ScheduleCreate(BaseModel):
    title: str
    date: date


class ScheduleResponse(BaseModel):
    id: int
    user_id: int
    title: str
    date: date

    class Config:
        from_attributes = True


# Notes
class NoteCreate(BaseModel):
    title: str
    content: str
    source: Optional[str] = None
    source_url: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class NoteResponse(BaseModel):
    id: int
    user_id: int
    title: str
    content: str
    source: Optional[str] = None
    source_url: Optional[str] = None

    class Config:
        from_attributes = True


# Playlists
class PlaylistCreate(BaseModel):
    title: str
    url: str


class PlaylistResponse(BaseModel):
    id: int
    user_id: int
    title: str
    url: str

    class Config:
        from_attributes = True


# Progress
class ProgressCreate(BaseModel):
    date: date
    tasks_completed: int
    study_hours: float
    notes_created: int


class ProgressResponse(BaseModel):
    id: int
    user_id: int
    date: date
    tasks_completed: int
    study_hours: float
    notes_created: int

    class Config:
        from_attributes = True


# Quiz
class QuizCreate(BaseModel):
    topic: str
    difficulty: Literal["easy", "medium", "hard"]
    week_start: int = 1
    week_end: int = 24


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int


class QuizResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    difficulty: str
    questions: List[QuizQuestion]

    class Config:
        from_attributes = True


# Video
class VideoSummaryRequest(BaseModel):
    video_title: str
    video_description: Optional[str] = None


class VideoQuestionRequest(BaseModel):
    question: str
    video_context: str


# Dashboard
class DashboardData(BaseModel):
    user: UserResponse
    learning_goal: Optional[LearningGoalResponse]
    recent_tasks: List[TaskResponse]
    progress_data: List[ProgressResponse]
    upcoming_schedule: List[ScheduleResponse]
