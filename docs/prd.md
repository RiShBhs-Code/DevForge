# DevForge — Product Requirements Document

## 1. Product Overview

### Product Name

**DevForge**

### Tagline

**Build Together. Ship Better.**

### Product Type

A lightweight collaborative project management platform designed for students and small development teams.

### Problem Statement

Students and small development teams often use multiple disconnected tools to manage projects, tasks, team communication, and progress.

DevForge provides a single platform where users can:

* Create and manage development projects
* Form project teams
* Create and assign tasks
* Track project progress
* Communicate through real-time project chat
* Receive real-time notifications
* Manage access through roles and authentication

DevForge is intentionally **not** a GitHub, Jira, or Discord clone.

The objective is to build a focused full-stack collaboration platform demonstrating modern frontend, backend, database, authentication, real-time communication, containerization, and CI/CD concepts.

---

# 2. Project Goals

DevForge should demonstrate the following capabilities:

1. Responsive frontend development
2. React component architecture
3. React Hooks
4. Global state management
5. REST API development
6. MongoDB database integration
7. CRUD operations
8. Secure API design
9. JWT authentication
10. Role-based authorization
11. Real-time communication using WebSockets
12. Docker containerization
13. Multi-container deployment using Docker Compose
14. Automated CI/CD using GitHub Actions

These capabilities correspond to the required full-stack development milestones.

---

# 3. Target Users

## 3.1 Student Developer

A student who joins development projects and works on assigned tasks.

Capabilities:

* Register/Login
* View projects
* Join projects
* View assigned tasks
* Update task status
* Participate in project chat
* Receive notifications

## 3.2 Project Leader

A student responsible for managing a project.

Capabilities:

* Everything a Student Developer can do
* Create projects
* Add/remove members
* Create tasks
* Assign tasks
* Update project information
* Monitor project progress

## 3.3 Admin

The system administrator.

Capabilities:

* View users
* View projects
* Manage users
* Remove inappropriate projects
* View basic platform statistics

Admin functionality should remain simple.

---

# 4. Scope

## In Scope

* Authentication
* User profiles
* Projects
* Team members
* Tasks
* Project dashboard
* Project chat
* Notifications
* Role-based authorization
* REST APIs
* MongoDB
* JWT
* WebSockets
* Docker
* Docker Compose
* GitHub Actions

## Out of Scope

The following should NOT be implemented:

* Git repository hosting
* Git commits
* Pull requests
* Code editor
* Code execution
* Video calls
* Voice calls
* Complex project management algorithms
* AI code generation
* Payment systems
* File storage
* Advanced analytics
* Microservices architecture
* Kubernetes

The application should remain a small and maintainable academic project.

---

# 5. Technology Stack

## Frontend

* React
* Vite
* TypeScript
* Tailwind CSS
* React Router
* Zustand
* Axios or Fetch API

## Backend

* Go
* Chi HTTP Router
* Official MongoDB Go Driver
* JWT
* bcrypt
* WebSocket library

## Database

MongoDB

## Infrastructure

* Docker
* Docker Compose

## CI/CD

GitHub Actions

---

# 6. High-Level Architecture

```text
                    ┌──────────────────────┐
                    │      React + Vite    │
                    │     TypeScript UI    │
                    └──────────┬───────────┘
                               │
                         HTTP / REST
                               │
                               ▼
                    ┌──────────────────────┐
                    │       Go API         │
                    │       Backend        │
                    └───────┬───────┬──────┘
                            │       │
                     MongoDB       WebSocket
                            │       │
                            ▼       ▼
                    ┌──────────┐  Real-time
                    │ MongoDB  │  Communication
                    └──────────┘
```

---

# 7. Application Structure

The application should contain the following major areas:

```text
Authentication
    ├── Login
    └── Register

Dashboard
    ├── Overview
    ├── My Projects
    ├── My Tasks
    └── Notifications

Projects
    ├── Project List
    ├── Create Project
    └── Project Workspace

Project Workspace
    ├── Overview
    ├── Tasks
    ├── Members
    └── Chat

Admin
    ├── Users
    └── Projects
```

---

# 8. Authentication

## Registration

Users should be able to create an account using:

* Name
* Email
* Password

The backend must:

1. Validate input
2. Check whether email already exists
3. Hash the password
4. Create the user
5. Return an authentication response

Passwords must NEVER be stored as plain text.

## Login

Users provide:

* Email
* Password

The backend validates credentials and returns a JWT.

The frontend should store the authentication state securely according to the chosen implementation.

## Protected Routes

Authenticated pages should not be accessible without a valid authentication token.

Examples:

```text
/dashboard
/projects
/projects/:id
/profile
```

---

# 9. Role-Based Authorization

Roles:

```text
ADMIN
LEADER
MEMBER
```

Example permissions:

| Feature            | Admin | Leader | Member |
| ------------------ | ----: | -----: | -----: |
| View Projects      |   Yes |    Yes |    Yes |
| Create Project     |   Yes |    Yes |    Yes |
| Edit Own Project   |   Yes |    Yes |     No |
| Delete Own Project |   Yes |    Yes |     No |
| Manage Members     |   Yes |    Yes |     No |
| Create Tasks       |   Yes |    Yes |     No |
| Assign Tasks       |   Yes |    Yes |     No |
| Update Own Task    |   Yes |    Yes |    Yes |
| Project Chat       |   Yes |    Yes |    Yes |
| Manage Users       |   Yes |     No |     No |

The backend must enforce authorization.

Frontend hiding of buttons is NOT considered sufficient security.

---

# 10. Dashboard

After login, users should see a dashboard containing:

### Overview Cards

* Total Projects
* Active Projects
* Assigned Tasks
* Completed Tasks

### My Projects

Display projects where the user is:

* Leader
* Member

### My Tasks

Display:

* Task name
* Project
* Status
* Deadline

### Recent Notifications

Display the latest notifications.

The dashboard should be responsive.

---

# 11. Project Management

Users should be able to create projects.

Project fields:

```text
title
description
status
deadline
leaderId
createdAt
updatedAt
```

Project statuses:

```text
PLANNING
ACTIVE
COMPLETED
ARCHIVED
```

## Project CRUD

Implement:

```text
Create Project
Read Project
Update Project
Delete Project
List Projects
```

Users should only be allowed to modify projects they own unless they are administrators.

---

# 12. Project Workspace

Each project should have a dedicated workspace.

Example:

```text
------------------------------------------------
DevForge Website

Planning | Active

[Overview] [Tasks] [Members] [Chat]

Progress: 65%

Tasks: 13
Completed: 8
Members: 4
------------------------------------------------
```

The workspace should act as the central area for project collaboration.

---

# 13. Task Management

Each project can contain multiple tasks.

Task fields:

```text
title
description
projectId
assignedTo
status
priority
deadline
createdAt
updatedAt
```

Statuses:

```text
TODO
IN_PROGRESS
COMPLETED
```

Priorities:

```text
LOW
MEDIUM
HIGH
```

## Task Operations

Users with appropriate permissions can:

* Create tasks
* Edit tasks
* Delete tasks
* Assign tasks
* Change task status

Members can update tasks assigned to them.

---

# 14. Task Board

The project task page should provide a simple Kanban-style layout:

```text
TODO              IN PROGRESS        COMPLETED

Design UI         Build API          Database
Login Page        JWT Auth            Landing Page
Dashboard         WebSocket           Navbar
```

Tasks should be visually separated by status.

Drag-and-drop is optional and should NOT be treated as a core requirement.

---

# 15. Team Management

Project leaders should be able to manage project members.

Members contain:

```text
userId
projectId
role
joinedAt
```

Project roles:

```text
LEADER
MEMBER
```

The project leader can:

* Add members
* Remove members
* View members

A user should not be added to the same project twice.

---

# 16. Real-Time Chat

Each project should have a simple real-time chat.

Example:

```text
Project Chat

Rishbh:
Backend API is ready.

Aryan:
I'll start integrating it.

Raj:
Dashboard UI is completed.
```

## Requirements

* Messages are associated with a project
* Only project members can access project chat
* Messages appear without refreshing the page
* New messages are delivered through WebSockets
* Messages contain sender and timestamp

The chat should remain text-only.

No images, videos, files, reactions, or voice messages are required.

---

# 17. Notifications

The system should generate notifications for important events.

Examples:

```text
You were added to DevForge Website.

You were assigned "JWT Authentication".

Aryan completed "Dashboard UI".

A new message was posted in DevForge Website.
```

Notifications should contain:

```text
id
userId
type
message
read
createdAt
```

The notification count should update in real time when practical.

---

# 18. REST API

The Go backend should expose REST APIs.

Example structure:

```text
/api/v1/auth
/api/v1/users
/api/v1/projects
/api/v1/tasks
/api/v1/notifications
```

Example endpoints:

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Projects

```text
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Tasks

```text
GET    /api/v1/projects/:id/tasks
POST   /api/v1/projects/:id/tasks
PUT    /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
```

### Members

```text
GET    /api/v1/projects/:id/members
POST   /api/v1/projects/:id/members
DELETE /api/v1/projects/:id/members/:userId
```

### Notifications

```text
GET   /api/v1/notifications
PATCH /api/v1/notifications/:id/read
```

---

# 19. WebSocket API

The backend should provide a WebSocket endpoint.

Example:

```text
/ws/projects/:projectId
```

Supported events:

```text
message:new
notification:new
```

A simple event format can be used:

```json
{
  "type": "message:new",
  "payload": {
    "message": "API completed"
  }
}
```

---

# 20. MongoDB Data Model

Collections:

```text
users
projects
tasks
project_members
messages
notifications
```

Keep the database model simple.

Do not introduce unnecessary collections.

---

# 21. Backend Architecture

The Go backend should follow a clean layered structure.

Recommended structure:

```text
backend/
├── cmd/
│   └── server/
│       └── main.go
│
├── internal/
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── tasks/
│   ├── members/
│   ├── notifications/
│   ├── chat/
│   ├── middleware/
│   └── database/
│
├── config/
├── migrations/
├── Dockerfile
├── go.mod
└── go.sum
```

Do not over-engineer the backend.

Avoid unnecessary patterns such as:

* Microservices
* Event sourcing
* CQRS
* Repository abstractions for every trivial operation
* Dependency injection frameworks

Simple, readable Go code is preferred.

---

# 22. Frontend Architecture

Recommended structure:

```text
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── routes/
│   └── App.tsx
│
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Use TypeScript throughout the frontend.

Avoid using `any` unless absolutely necessary.

---

# 23. State Management

Use Zustand for global state.

Recommended stores:

```text
authStore
projectStore
notificationStore
```

Do not put every piece of UI state into Zustand.

Local component state should remain inside React components when appropriate.

---

# 24. React Hooks

Use React Hooks appropriately.

Examples:

```text
useState
useEffect
useMemo
useCallback
```

Create custom hooks where they improve code reuse.

Examples:

```text
useAuth()
useProjects()
useTasks()
useWebSocket()
```

Do not create custom hooks merely for the sake of demonstrating hooks.

---

# 25. API Service Layer

Frontend API communication should be centralized.

Example:

```text
services/
├── authApi.ts
├── projectApi.ts
├── taskApi.ts
├── memberApi.ts
└── notificationApi.ts
```

Components should not contain large amounts of raw API request logic.

---

# 26. Error Handling

The backend should return consistent errors.

Example:

```json
{
  "success": false,
  "message": "Project not found"
}
```

Frontend should display user-friendly errors.

Examples:

```text
Invalid credentials.

You don't have permission to perform this action.

Project could not be created.

Something went wrong. Please try again.
```

Avoid exposing internal backend errors to users.

---

# 27. Validation

Validate input on both:

### Frontend

For immediate user feedback.

### Backend

For security and correctness.

Backend validation is mandatory.

Never trust frontend validation alone.

---

# 28. Security Requirements

The application should:

* Hash passwords using bcrypt
* Authenticate using JWT
* Protect private routes
* Validate request bodies
* Validate IDs
* Enforce role-based authorization
* Prevent unauthorized project access
* Never expose passwords
* Never hard-code secrets
* Use environment variables
* Configure CORS appropriately

Example environment variables:

```text
PORT
MONGODB_URI
JWT_SECRET
CLIENT_URL
```

Provide a `.env.example`.

Never commit real secrets.

---

# 29. Docker

The project should be containerized.

Required containers:

```text
frontend
backend
mongodb
```

Docker Compose should start the complete application.

Example:

```text
docker compose up
```

should start the required services.

---

# 30. Docker Compose

The Compose configuration should define:

```text
frontend
backend
mongodb
```

Services should communicate through the Docker Compose network.

MongoDB data should use a persistent Docker volume.

---

# 31. CI/CD

GitHub Actions should automatically run when code is pushed.

Pipeline:

```text
Git Push
   ↓
Install Dependencies
   ↓
Run Tests
   ↓
Build Frontend
   ↓
Build Backend
   ↓
Build Docker Images
   ↓
Deploy
```

The initial implementation may stop at successful build verification if deployment infrastructure is not available.

---

# 32. Testing

Testing should focus on important functionality.

Backend:

* Authentication
* Project creation
* Authorization
* Task operations

Frontend:

* Login form
* Dashboard rendering
* Project creation
* Task status changes

End-to-end testing is optional for the first version.

---

# 33. Responsive Design

The frontend must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Core pages must remain usable on smaller screens.

Responsive behavior should be implemented using Tailwind CSS.

Do not create a separate mobile application.

---

# 34. UX Requirements

The interface should provide:

* Clear navigation
* Loading states
* Empty states
* Error states
* Success feedback
* Confirmation before destructive actions
* Disabled states during API requests
* Responsive layouts

Examples:

```text
Loading Projects...

No projects yet.

Failed to load tasks.

Project created successfully.

Are you sure you want to delete this project?
```

---

# 35. Navigation

Primary navigation:

```text
Dashboard
Projects
My Tasks
Notifications
Profile
```

Admin users additionally see:

```text
Admin
```

---

# 36. MVP Definition

The project is considered an MVP when a user can:

1. Register
2. Login
3. View dashboard
4. Create a project
5. View project
6. Add team members
7. Create tasks
8. Assign tasks
9. Update task status
10. Chat with project members in real time
11. Receive notifications
12. Logout

The application must work end-to-end before additional features are added.

---

# 37. Development Phases

## Phase 1 — Project Setup

* Create React + Vite + TypeScript frontend
* Create Go backend
* Configure MongoDB
* Configure environment variables
* Configure Git repository
* Create basic project structure

## Phase 2 — Authentication

* Registration
* Login
* Password hashing
* JWT generation
* JWT middleware
* Protected frontend routes
* Logout

## Phase 3 — Dashboard

* Dashboard layout
* Project summary
* Task summary
* Notifications
* Responsive UI

## Phase 4 — Projects

* Project CRUD
* Project listing
* Project details
* Project status
* Project dashboard

## Phase 5 — Tasks

* Task CRUD
* Task assignment
* Task status
* Task priority
* Task board

## Phase 6 — Team Management

* Add members
* Remove members
* View members
* Role handling
* Permission checks

## Phase 7 — Real-Time Features

* WebSocket connection
* Project chat
* Real-time messages
* Real-time notifications

## Phase 8 — Docker

* Frontend Dockerfile
* Backend Dockerfile
* MongoDB service
* Docker Compose
* Persistent database volume

## Phase 9 — CI/CD

* GitHub Actions
* Install dependencies
* Run tests
* Build frontend
* Build backend
* Build Docker images

## Phase 10 — Finalization

* Error handling
* Validation
* Security review
* Responsive testing
* Documentation
* Demo preparation

---

# 38. Priority System

Features should be implemented according to priority.

## P0 — Mandatory

```text
Authentication
Dashboard
Projects
Tasks
MongoDB
REST API
JWT
Docker
```

## P1 — Required

```text
Team Management
WebSocket Chat
Notifications
Docker Compose
GitHub Actions
```

## P2 — Optional

```text
Dark Mode
Search
Task Filtering
Sorting
Pagination
Activity Timeline
```

P2 features must only be implemented after all P0 and P1 features are stable.

---

# 39. Vibe Coding Rules

The AI coding agent must follow these rules:

### Rule 1 — Do Not Overengineer

Prefer the simplest implementation that satisfies the requirement.

### Rule 2 — Do Not Expand Scope

Do not introduce features that are not present in this PRD unless explicitly requested.

### Rule 3 — Preserve Existing Functionality

Before modifying existing code, understand how the current implementation works.

### Rule 4 — Small Changes

Implement features incrementally.

Do not rewrite the entire application for a small feature.

### Rule 5 — Type Safety

Frontend code should use TypeScript properly.

Avoid unnecessary `any`.

### Rule 6 — Backend Security

Never bypass authentication or authorization for convenience.

### Rule 7 — Environment Variables

Secrets must never be hard-coded.

### Rule 8 — API Consistency

Follow the existing API conventions.

### Rule 9 — Error Handling

Every API request should handle loading, success, and failure states appropriately.

### Rule 10 — Test Before Declaring Complete

A feature is not complete merely because the code compiles.

Verify the actual user flow.

---

# 40. Definition of Done

A feature is complete when:

* Code compiles
* Application runs
* Required API works
* Database operations work
* Authentication/authorization is respected
* Loading state exists
* Error handling exists
* UI is responsive
* No obvious console errors exist
* Existing functionality remains working

---

# 41. Final Success Criteria

DevForge should demonstrate a complete full-stack workflow:

```text
User
 ↓
React + TypeScript
 ↓
REST API
 ↓
Go Backend
 ↓
JWT Authentication
 ↓
Authorization
 ↓
MongoDB
```

For real-time functionality:

```text
React
 ↓
WebSocket
 ↓
Go Backend
 ↓
Project Members
```

For deployment:

```text
GitHub
 ↓
GitHub Actions
 ↓
Docker Build
 ↓
Docker Compose
 ↓
Application
```

The final application should be a **small, polished, functional collaborative project management platform**, not a feature-heavy clone of existing products.

---

# 42. Final Product Statement

**DevForge is a real-time collaborative project management platform that enables students to create projects, form teams, manage tasks, and communicate securely throughout the project lifecycle.**

The project should prioritize:

**Simplicity → Functionality → Reliability → Demonstrability**

over unnecessary feature complexity.
