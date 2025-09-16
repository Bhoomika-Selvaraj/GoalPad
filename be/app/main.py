from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import os
from dotenv import load_dotenv

from .database import get_db, engine, Base
from .models import User, LearningGoal, Task, Schedule, Note, Playlist, Progress, Quiz
from .schemas import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
    LearningGoalCreate,
    LearningGoalResponse,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    ScheduleCreate,
    ScheduleResponse,
    NoteCreate,
    NoteUpdate,
    NoteResponse,
    PlaylistCreate,
    PlaylistResponse,
    ProgressCreate,
    ProgressResponse,
    QuizCreate,
    QuizResponse,
    RoadmapRequest,
    VideoSummaryRequest,
    VideoQuestionRequest,
    DashboardData,
)
from .auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)
from .ai_service import ai_service

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="GoalPad", version="1.0.0")

# CORS middleware (dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dev reset (no auth) – clears all tables
@app.post("/dev/reset")
async def dev_reset(db: Session = Depends(get_db)):
    db.query(Progress).delete()
    db.query(Note).delete()
    db.query(Playlist).delete()
    db.query(Schedule).delete()
    db.query(Task).delete()
    db.query(LearningGoal).delete()
    db.query(Quiz).delete()
    db.query(User).delete()
    db.commit()
    return {"message": "Reset complete"}


# Auth endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_credentials.username).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# AI Integration endpoints (clarify removed)


@app.post("/ai/generate-roadmap", response_model=LearningGoalResponse)
async def generate_roadmap(
    request: RoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Generate roadmap using AI
    roadmap_data = await ai_service.generate_roadmap(request.topic, request.details)

    # Save or update learning goal
    learning_goal = (
        db.query(LearningGoal).filter(LearningGoal.user_id == current_user.id).first()
    )
    if learning_goal:
        learning_goal.topic = request.topic
        learning_goal.details = request.details
        learning_goal.roadmap = roadmap_data.model_dump()
    else:
        learning_goal = LearningGoal(
            user_id=current_user.id,
            topic=request.topic,
            details=request.details,
            roadmap=roadmap_data.model_dump(),
        )
        db.add(learning_goal)

    db.commit()
    db.refresh(learning_goal)

    # Create tasks from roadmap (support dicts or Pydantic objects)
    for week_data in roadmap_data.weeks:
        for task_data in week_data.tasks:
            if isinstance(task_data, dict):
                title = task_data.get("description", "")
                quadrant = task_data.get("quadrant") or "Q2"
            else:
                title = getattr(task_data, "description", "")
                quadrant = getattr(task_data, "quadrant", None) or "Q2"

            task = Task(
                user_id=current_user.id,
                title=title,
                quadrant=quadrant,
                week=week_data.week,
            )
            db.add(task)

    db.commit()
    return learning_goal


@app.post("/ai/generate-quiz", response_model=QuizResponse)
async def generate_quiz(
    request: QuizCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get plan context, if any
    lg = db.query(LearningGoal).filter(LearningGoal.user_id == current_user.id).first()
    plan_summary = ""
    if lg and lg.roadmap:
        try:
            weeks = lg.roadmap.get("weeks", [])
            lines = []
            for w in weeks:
                theme = w.get("theme", "")
                ws = w.get("week")
                tasks = w.get("tasks", [])
                task_texts = [
                    (t.get("description") if isinstance(t, dict) else str(t))
                    for t in tasks
                ]
                lines.append(f"Week {ws} – {theme}: " + "; ".join(task_texts))
            plan_summary = "\n".join(lines)
        except Exception:
            plan_summary = ""

    quiz_data = await ai_service.generate_quiz(
        request.topic,
        request.difficulty,
        plan_context=plan_summary,
        week_start=request.week_start,
        week_end=request.week_end,
    )

    quiz = Quiz(
        user_id=current_user.id,
        topic=request.topic,
        difficulty=request.difficulty,
        questions=quiz_data.model_dump()["questions"],
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


@app.post("/ai/video-summary")
async def get_video_summary(request: VideoSummaryRequest):
    summary = await ai_service.generate_video_summary(
        request.video_title, request.video_description
    )
    return {"summary": summary}


@app.post("/ai/answer-question")
async def answer_question(request: VideoQuestionRequest):
    answer = await ai_service.answer_contextual_question(
        request.question, request.video_context
    )
    return {"answer": answer}


# Dashboard endpoint
@app.get("/dashboard", response_model=DashboardData)
async def get_dashboard(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    learning_goal = (
        db.query(LearningGoal).filter(LearningGoal.user_id == current_user.id).first()
    )
    # Return all tasks ordered by week then created time
    recent_tasks = (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .order_by(Task.week.asc(), Task.created_at.asc())
        .all()
    )
    progress_data = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id)
        .order_by(Progress.date.desc())
        .limit(30)
        .all()
    )
    upcoming_schedule = (
        db.query(Schedule)
        .filter(Schedule.user_id == current_user.id)
        .order_by(Schedule.date.asc())
        .limit(7)
        .all()
    )

    return DashboardData(
        user=current_user,
        learning_goal=learning_goal,
        recent_tasks=recent_tasks,
        progress_data=progress_data,
        upcoming_schedule=upcoming_schedule,
    )


# Task endpoints
@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(Task).filter(Task.user_id == current_user.id).all()


@app.post("/tasks", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_task = Task(user_id=current_user.id, **task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


# Schedule endpoints
@app.get("/schedule", response_model=List[ScheduleResponse])
async def get_schedule(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(Schedule).filter(Schedule.user_id == current_user.id).all()


@app.post("/schedule", response_model=ScheduleResponse)
async def create_schedule(
    schedule: ScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_schedule = Schedule(user_id=current_user.id, **schedule.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule


# Notes endpoints
@app.get("/notes", response_model=List[NoteResponse])
async def get_notes(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(Note)
        .filter(Note.user_id == current_user.id)
        .order_by(Note.created_at.desc())
        .all()
    )


@app.post("/notes", response_model=NoteResponse)
async def create_note(
    note: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_note = Note(user_id=current_user.id, **note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@app.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_update: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = (
        db.query(Note)
        .filter(Note.id == note_id, Note.user_id == current_user.id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    update_data = note_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    return note


@app.delete("/notes/{note_id}")
async def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = (
        db.query(Note)
        .filter(Note.id == note_id, Note.user_id == current_user.id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}


# Playlist endpoints
@app.get("/playlists", response_model=List[PlaylistResponse])
async def get_playlists(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(Playlist).filter(Playlist.user_id == current_user.id).all()


@app.post("/playlists", response_model=PlaylistResponse)
async def create_playlist(
    playlist: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_playlist = Playlist(user_id=current_user.id, **playlist.model_dump())
    db.add(db_playlist)
    db.commit()
    db.refresh(db_playlist)
    return db_playlist


# Progress endpoints
@app.post("/progress", response_model=ProgressResponse)
async def create_progress(
    progress: ProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Check if progress for this date already exists
    existing = (
        db.query(Progress)
        .filter(Progress.user_id == current_user.id, Progress.date == progress.date)
        .first()
    )

    if existing:
        # Update existing progress
        for field, value in progress.model_dump().items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new progress
        db_progress = Progress(user_id=current_user.id, **progress.model_dump())
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        return db_progress


# Profile endpoints
@app.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@app.put("/profile", response_model=UserResponse)
async def update_profile(
    name: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if name is not None:
        current_user.name = name
        db.commit()
        db.refresh(current_user)
    return current_user


@app.delete("/profile")
async def delete_account(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    # Delete all user data
    db.query(Progress).filter(Progress.user_id == current_user.id).delete()
    db.query(Note).filter(Note.user_id == current_user.id).delete()
    db.query(Playlist).filter(Playlist.user_id == current_user.id).delete()
    db.query(Schedule).filter(Schedule.user_id == current_user.id).delete()
    db.query(Task).filter(Task.user_id == current_user.id).delete()
    db.query(LearningGoal).filter(LearningGoal.user_id == current_user.id).delete()
    db.query(Quiz).filter(Quiz.user_id == current_user.id).delete()
    db.query(User).filter(User.id == current_user.id).delete()

    db.commit()
    return {"message": "Account deleted successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
