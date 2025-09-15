# Requirements Document

## Introduction

GoalPad is a full‑stack productivity + learning app that turns a single topic into a structured 24‑week plan. It includes onboarding, a weekly checklist dashboard, curated YouTube links per week, an AI quiz generator, sticky notes, and a minimal auth system. The backend is FastAPI with SQLAlchemy/PostgreSQL and Gemini integration; the frontend is Next.js + Tailwind.

## Requirements

### R1 Onboarding – Generate 24‑week roadmap

**User Story:** As a learner, I want to enter one topic and instantly get a 24‑week roadmap so I can follow a structured plan.

**Acceptance Criteria**

1. WHEN I sign up/log in AND submit a topic THEN the backend SHALL create a 24‑week roadmap with `weeks[{week, theme, tasks[], videos[]}]`.
2. Each week SHALL contain 4–6 tasks; tasks may include quadrant tags `{Q1..Q4}` but UI will strip them for display.
3. Each week SHALL contain up to 4 curated YouTube links in `videos[]`.
4. WHILE generating, the UI SHALL show a blocking loader; on success, redirect to the dashboard.
5. IF AI fails, the API SHALL return an error; no silent fallbacks.

### R2 Dashboard – Weekly checklist with progress

**User Story:** As a learner, I want a simple weekly checklist and progress at a glance so I can track completion.

**Acceptance Criteria**

1. The dashboard SHALL list 24 weeks, collapsible, ordered 1→24.
2. Each week SHALL show a circular percent based on completed vs total tasks for that week.
3. A global progress bar SHALL show total completed vs total tasks across all weeks.
4. Checking a task SHALL persist `completed=true` via API and update progress immediately (optimistic update).
5. The UI SHALL be black/white with rounded‑2xl and subtle shadows.

### R3 YouTube – Per‑week links

**User Story:** As a learner, I want quick access to relevant videos per week so I can gain clarity faster.

**Acceptance Criteria**

1. The YouTube tab SHALL list weeks with up to 4 links from roadmap.weeks[].videos.
2. Links SHALL open in a new tab.
3. If the roadmap has no `videos[]`, the view SHALL display guidance to regenerate the plan.

### R4 Quiz Bomber – 5 questions, 4 options

**User Story:** As a learner, I want short quizzes limited to my current coverage so I can self‑check.

**Acceptance Criteria**

1. The quiz form SHALL include: a week slider (1–24) and difficulty (easy|medium|hard).
2. The backend SHALL generate exactly 5 multiple‑choice questions, each with exactly 4 options (A–D) and a 0‑based `correct_answer`.
3. Results view SHALL show per‑question correctness and highlight correct/selected options; no score persistence.
4. The quiz prompt MAY also return a short list of relevant YT links for discovery (not stored).

### R5 Auth – Minimal JWT

**User Story:** As a user, I want to register and log in simply so that my plan and tasks are saved.

**Acceptance Criteria**

1. Register: username, email, password, optional name; store salted hash.
2. Login: returns JWT; frontend SHALL store in localStorage and attach `Authorization: Bearer <token>`.
3. Unauthorized requests SHALL return 401/403 and trigger logout/redirect on the client.

### R6 Data & API

**User Story:** As a developer, I want a stable schema so the UI and integrations are reliable.

**Acceptance Criteria**

1. Models: User, LearningGoal(roadmap json), Task(user_id, title, week, completed, quadrant), Note, Playlist(optional), Progress(optional).
2. `/dashboard` SHALL return: `user, learning_goal, recent_tasks (all, ordered by week then created), progress_data (optional).`
3. `/ai/generate-roadmap` SHALL upsert the user’s learning_goal and create tasks per week.
4. `/ai/generate-quiz` SHALL accept `{ topic, difficulty, week_start, week_end }` and return the quiz JSON.

### R7 UX & Accessibility

**Acceptance Criteria**

1. Responsive layout for desktop and common mobile widths.
2. Focus states and keyboard navigation for checkboxes and buttons.
3. Loading indicators for async actions; error toasts with actionable messages.

### R8 Non‑functional

**Acceptance Criteria**

1. No secrets committed; configs via env files.
2. API requests SHALL complete within reasonable timeouts; errors bubble with proper codes.
3. Code SHALL avoid dead imports/unused vars; Typescript types at boundaries; Python code PEP‑8-ish.
