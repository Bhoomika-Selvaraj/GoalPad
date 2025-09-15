# Design Document

## Overview

GoalPad is a full-stack productivity and learning application that transforms a single learning topic into a structured 24-week roadmap with weekly task checklists, curated YouTube video links, AI-powered quiz generation, and sticky notes functionality. The system features a minimal JWT authentication system and provides comprehensive progress tracking.

The frontend is built with Next.js (App Router) and TypeScript, styled with Tailwind CSS for a clean black/white aesthetic with rounded corners and subtle shadows. The backend uses FastAPI with SQLAlchemy ORM for PostgreSQL persistence and integrates Google Gemini AI for intelligent roadmap and quiz generation.

## Architecture

```mermaid
graph TB
  subgraph Frontend [Frontend (Next.js + TS)]
    UI[Pages & Components]
    API[Axios Client]
    STATE[AuthContext]
    UI --> API
    UI --> STATE
  end

  subgraph Backend [Backend (FastAPI + SQLAlchemy)]
    APP[FastAPI App]
    AUTH[JWT Auth]
    AI[AI Service (Gemini)]
    DB[(PostgreSQL)]
    APP --> AUTH
    APP --> AI
    APP --> DB
  end

  subgraph External
    GEMINI[Gemini API]
  end

  UI --> APP
  AI --> GEMINI
```

## Data Models

### Core Entities

- **User**: `id, username, email, hashed_password, name, created_at`
  - Stores user authentication and profile information
  - Password hashed using bcrypt for security

- **LearningGoal**: `id, user_id, topic, details, roadmap_json, created_at`
  - Contains the generated 24-week roadmap as JSON
  - One learning goal per user (upserted on regeneration)

- **Task**: `id, user_id, title, quadrant, week, completed, created_at`
  - Individual tasks extracted from roadmap weeks
  - Quadrant tags (Q1-Q4) stored but stripped in UI display
  - Completion tracking for progress calculation

- **Note**: `id, user_id, title, content, source, source_url, created_at`
  - Sticky notes functionality for user annotations
  - Optional source linking for reference materials

- **Playlist**: `id, user_id, name, description, created_at` (Optional)
  - Future extension for organizing video collections

- **Progress**: `id, user_id, week, completion_percentage, updated_at` (Optional)
  - Cached progress calculations for performance

### Roadmap JSON Structure

The roadmap JSON follows this exact structure to ensure consistent AI generation:

```json
{
  "weeks": [
    {
      "week": 1,
      "theme": "Introduction to Topic",
      "tasks": [
        { "quadrant": "Q2", "description": "Complete foundational reading" },
        { "quadrant": "Q1", "description": "Practice basic exercises" }
      ],
      "videos": [
        "https://youtu.be/example1",
        "https://youtu.be/example2",
        "https://youtu.be/example3",
        "https://youtu.be/example4"
      ]
    }
  ]
}
```

**Design Rationale**: Each week contains 4-6 tasks and up to 4 curated YouTube links. Quadrant tags provide task categorization but are hidden from users to maintain UI simplicity.

## Backend Components

### Core Application (`app/main.py`)
- FastAPI application with CORS middleware configured for localhost:3000 in development
- JWT authentication middleware for protected routes
- Endpoint groups:
  - `/auth/*` - Registration, login, token management
  - `/dashboard` - Main dashboard data aggregation
  - `/ai/*` - AI-powered roadmap and quiz generation
  - `/tasks/*`, `/notes/*`, `/playlists/*` - CRUD operations

### AI Integration Service (`app/ai_service.py`)
- **`generate_roadmap(topic, details)`**: 
  - Calls Google Gemini API with structured prompts
  - Returns 24-week roadmap with themes, tasks (4-6 per week), and curated YouTube links (up to 4 per week)
  - Handles AI failures with explicit error responses (no silent fallbacks)
  
- **`generate_quiz(topic, difficulty, week_start, week_end)`**:
  - Generates exactly 5 multiple-choice questions with 4 options each
  - Uses 0-based indexing for correct answers
  - Filters content based on week range for targeted assessment
  - May include bonus YouTube links for further learning

**Design Rationale**: Separate AI service allows for easy testing and potential future AI provider switching.

### Data Layer
- **`app/models.py`**: SQLAlchemy ORM entities with proper relationships and constraints
- **`app/schemas.py`**: Pydantic models for request/response validation and serialization
- **`app/database.py`**: Database session management and connection pooling
- **`app/auth.py`**: JWT token creation/verification and bcrypt password hashing

**Design Rationale**: Clear separation of concerns with dedicated modules for each responsibility.

## Frontend Components

### Application Structure
- **App Router**: Next.js 13+ app directory with `layout.tsx` and nested page routing
- **Styling**: Tailwind CSS with black/white theme, rounded-2xl corners, and subtle shadows
- **TypeScript**: Full type safety with comprehensive interface definitions

### Core Components

#### Authentication & Onboarding
- **`AuthPage`**: Minimal login/register forms with validation using react-hook-form
- **`OnboardingFlow`**: Topic input form with loading states and error handling
  - Calls `/ai/generate-roadmap` and redirects to dashboard on success
  - Shows blocking loader during AI generation

#### Dashboard & Progress Tracking
- **`Dashboard`**: Main interface with 24-week collapsible checklist
  - Each week shows circular progress indicator (completed/total tasks)
  - Global progress bar displays overall completion across all weeks
  - Optimistic UI updates for immediate task completion feedback
  - Tasks display without quadrant tags for clean UX

#### Learning Features
- **`YouTubePlayer`**: Per-week video link display
  - Shows up to 4 curated links from `roadmap.weeks[].videos`
  - Links open in new tabs for uninterrupted learning flow
  - Fallback UI when no videos available with regeneration guidance

- **`QuizBomber`**: AI-powered quiz interface
  - Week range slider (1-24) and difficulty selection (easy/medium/hard)
  - Displays exactly 5 questions with 4 options each (A-D)
  - Results view highlights correct answers and user selections
  - No score persistence (session-based assessment)

#### Productivity Features
- **`StickyNotes`**: Note-taking interface with CRUD operations
- **`Sidebar`**: Collapsible navigation with tab-based routing
- **`Profile`**: User settings and account management

### State Management & API Integration
- **`AuthContext`**: User authentication state with token persistence in localStorage
- **`lib/api.ts`**: Axios-based API client with:
  - Request interceptors for automatic token attachment
  - Response interceptors for 401/403 handling and automatic logout
  - Organized API functions by feature area

**Design Rationale**: Component-based architecture promotes reusability and maintainability. Optimistic updates provide immediate feedback while maintaining data consistency.

## Request Flow Examples

### User Registration & Authentication
1. **Registration**: FE POST `/auth/register` with `{username, email, password, name?}`
2. **Login**: FE POST `/auth/login` returns JWT token
3. **Token Storage**: Frontend stores token in localStorage and attaches to all requests
4. **Auto-logout**: 401/403 responses trigger automatic logout and redirect

### Roadmap Generation Flow
1. **Input**: User submits topic through OnboardingFlow component
2. **Generation**: FE POST `/ai/generate-roadmap` with `{topic, details?}`
3. **AI Processing**: Backend calls Gemini API with structured prompts
4. **Data Persistence**: Backend upserts LearningGoal and creates individual Task records
5. **Redirect**: Frontend redirects to dashboard and fetches `/dashboard`
6. **Display**: Dashboard shows 24-week checklist with progress indicators

### Dashboard Data Loading
1. **Request**: FE GET `/dashboard` on page load
2. **Response**: Backend returns `{user, learning_goal, recent_tasks, progress_data?}`
3. **Rendering**: Frontend displays collapsible weeks with task completion status

### Task Completion Flow
1. **User Action**: User checks/unchecks task checkbox
2. **Optimistic Update**: UI immediately reflects change
3. **API Call**: FE PUT `/tasks/{task_id}` with `{completed: boolean}`
4. **Progress Recalculation**: Backend updates task and recalculates progress
5. **UI Sync**: Progress circles and global bar update automatically

### Quiz Generation Flow
1. **Input**: User selects week range and difficulty in QuizBomber
2. **Request**: FE POST `/ai/generate-quiz` with `{topic, difficulty, week_start, week_end}`
3. **AI Processing**: Backend calls Gemini with filtered roadmap context
4. **Response**: Exactly 5 questions with 4 options each, 0-based correct answers
5. **Display**: Frontend renders quiz with immediate result feedback

**Design Rationale**: Request flows prioritize user experience with optimistic updates and clear error handling. AI integration points have explicit failure modes without silent fallbacks.

## Error Handling

### Backend Error Strategy
- **HTTP Exceptions**: Raise HTTPException with explicit status codes and descriptive messages
- **Logging**: Log stack trace summaries for debugging without exposing sensitive data
- **AI Failures**: No silent fallbacks - all AI service errors bubble to client with actionable messages
- **Validation Errors**: Pydantic validation errors return 422 with field-specific details

### Frontend Error Strategy
- **Toast Notifications**: Use react-hot-toast for user-friendly error messages
- **Authentication Errors**: 401/403 responses trigger automatic logout and redirect to login
- **Loading States**: Show appropriate loading indicators during async operations
- **Form Validation**: Real-time validation feedback with react-hook-form
- **Network Errors**: Graceful handling of connection issues with retry options

### Specific Error Scenarios
- **AI Generation Failures**: Show error toast with option to retry roadmap generation
- **Task Update Failures**: Revert optimistic updates and show error message
- **Authentication Expiry**: Automatic token refresh or logout with session restoration
- **Network Timeouts**: Configurable timeout handling with user feedback

**Design Rationale**: Explicit error handling ensures users understand what went wrong and how to proceed. No silent failures maintain system transparency and user trust.

## Testing Strategy

### Backend Testing
- **Unit Tests**: Test individual functions in AI service, auth utilities, and data models
- **Integration Tests**: Test API endpoints with database interactions
- **AI Service Tests**: Mock Gemini API responses for consistent testing
- **Authentication Tests**: Verify JWT creation, validation, and expiry handling

### Frontend Testing
- **Component Tests**: Test individual React components with React Testing Library
- **Integration Tests**: Test user flows like onboarding and task completion
- **API Client Tests**: Mock API responses for reliable frontend testing
- **Accessibility Tests**: Ensure keyboard navigation and screen reader compatibility

**Design Rationale**: Comprehensive testing strategy ensures reliability across the full stack, with particular attention to AI integration points and user authentication flows.

## Non-Functional Requirements

### Performance
- **Simple Endpoints**: Lightweight API responses with minimal data processing
- **Optimistic Updates**: Immediate UI feedback for task completion and form submissions
- **Ordered Queries**: Database queries optimized with proper indexing on user_id and week columns
- **Reasonable Timeouts**: API requests complete within acceptable time limits with proper error handling

### Security
- **Authentication**: JWT tokens with secure generation and validation
- **Password Security**: Bcrypt hashing with appropriate salt rounds
- **CORS Configuration**: Locked to localhost:3000 in development, configurable for production
- **Environment Variables**: No secrets committed to version control
- **Input Validation**: Comprehensive validation at API boundaries using Pydantic

### Accessibility
- **Responsive Design**: Desktop and mobile-friendly layouts
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Focus States**: Clear visual focus indicators for form controls and buttons
- **Semantic HTML**: Proper heading hierarchy and ARIA labels where needed
- **Loading Indicators**: Clear feedback for async operations

### Code Quality
- **TypeScript**: Full type safety at component and API boundaries
- **Python Standards**: PEP-8 compliant code formatting
- **Clean Code**: No dead imports, unused variables, or redundant code
- **Environment Configuration**: Proper separation of development and production configs

**Design Rationale**: Non-functional requirements ensure the application is secure, performant, and accessible while maintaining high code quality standards.

## Future Enhancements

### Planned Extensions
- **Task Management**: Drag-and-drop task reordering within weeks
- **Calendar Integration**: Sync tasks with external calendar applications
- **Data Portability**: Export/import roadmap JSON for backup and sharing
- **Analytics**: User progress analytics, learning streaks, and completion insights
- **Social Features**: Share roadmaps and progress with learning communities
- **Advanced AI**: Personalized task recommendations based on completion patterns

### Technical Debt & Improvements
- **Observability**: Structured logging and monitoring for production deployment
- **Caching**: Redis integration for improved performance on repeated AI requests
- **Real-time Updates**: WebSocket integration for collaborative learning features
- **Mobile App**: React Native application for mobile-first learning experience

**Design Rationale**: Future enhancements are designed to build upon the solid foundation established in the initial implementation, focusing on user engagement and system scalability.
