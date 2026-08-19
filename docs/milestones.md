# DevForge — Development Milestones

DevForge is developed through **5 sequential milestones**.

Each milestone represents a complete, testable product increment.

The AI Builder must implement **only the active milestone** defined in `memory.md`.

A milestone is considered complete only when all requirements listed under it are implemented, integrated, tested, and working with the existing application.

---

# Milestone 1 — Foundation & Secure Access

## Objective

Establish the complete application foundation, visual system, database connection, REST API structure, and secure authentication system.

The application should be able to run end-to-end with users registering, logging in, and accessing protected pages.

## Features

### Project Foundation

* [ ] Initialize React + Vite + TypeScript frontend
* [ ] Initialize Go backend
* [ ] Configure Chi HTTP router
* [ ] Configure MongoDB connection
* [ ] Configure environment variables
* [ ] Establish frontend/backend project structure
* [ ] Configure React Router
* [ ] Configure Zustand/global state
* [ ] Establish API client
* [ ] Establish consistent API response/error handling

### Design System

Implement the visual language defined in `DESIGN.md`.

* [ ] Dark-first interface
* [ ] Almost-black application background
* [ ] Surface-based tonal layering
* [ ] Neon signal accent usage
* [ ] Hanken Grotesk typography for headings
* [ ] Geist typography for body content
* [ ] JetBrains Mono for technical labels
* [ ] Consistent spacing system
* [ ] Consistent border radius system
* [ ] Responsive layout foundation
* [ ] Reusable UI primitives
* [ ] Buttons
* [ ] Inputs
* [ ] Badges
* [ ] Modals
* [ ] Cards/panels
* [ ] Loading states
* [ ] Empty states
* [ ] Error states
* [ ] Success feedback

### Authentication

* [ ] User registration
* [ ] User login
* [ ] Password hashing using bcrypt
* [ ] JWT generation
* [ ] JWT validation middleware
* [ ] Authentication state management
* [ ] Protected frontend routes
* [ ] `/auth/register`
* [ ] `/auth/login`
* [ ] `/auth/me`
* [ ] Logout
* [ ] Authentication error handling

### User Roles

Implement the three application roles:

* [ ] ADMIN
* [ ] LEADER
* [ ] MEMBER

Implement backend authorization middleware.

Frontend permission checks must complement, not replace, backend authorization.

### User Profile

* [ ] Profile page
* [ ] Display user information
* [ ] Basic profile editing
* [ ] Role display
* [ ] Logout action

## Required User Flow

```text
Register
   ↓
Login
   ↓
JWT issued
   ↓
Protected Dashboard
   ↓
Profile
   ↓
Logout
```

## Completion Criteria

* Application runs successfully
* Frontend communicates with backend
* MongoDB connection works
* Registration works
* Login works
* JWT authentication works
* Protected routes work
* Authorization works
* Logout works
* Design system is consistently applied
* No major TypeScript/build/runtime errors exist

---

# Milestone 2 — Dashboard & Project Management

## Objective

Build the core project-management experience.

Users should be able to discover their projects, create projects, view project information, and manage the project lifecycle.

## Features

### Main Application Navigation

Implement the primary navigation:

* [ ] Dashboard
* [ ] Projects
* [ ] My Tasks
* [ ] Notifications
* [ ] Profile
* [ ] Admin navigation for administrators

### Dashboard

Create the responsive dashboard described in the PRD.

#### Overview

* [ ] Total Projects
* [ ] Active Projects
* [ ] Assigned Tasks
* [ ] Completed Tasks

#### My Projects

* [ ] Projects where the user is leader
* [ ] Projects where the user is member
* [ ] Project status indicators
* [ ] Project deadline information

#### My Tasks

* [ ] Assigned task list
* [ ] Task status
* [ ] Task deadline
* [ ] Associated project

#### Recent Notifications

* [ ] Recent notification preview
* [ ] Notification read state

### Project Management

Implement complete project CRUD.

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

Operations:

* [ ] Create project
* [ ] List projects
* [ ] View project
* [ ] Update project
* [ ] Delete project
* [ ] Project status management
* [ ] Deadline management
* [ ] Permission enforcement

### Project Workspace

Every project should have a dedicated workspace.

Workspace structure:

```text
Project Header

Overview
Tasks
Members
Chat

Progress
Task Summary
Member Summary
```

Implement:

* [ ] Project overview
* [ ] Project status
* [ ] Project deadline
* [ ] Progress calculation
* [ ] Task count
* [ ] Completed task count
* [ ] Member count
* [ ] Workspace navigation

### REST API

Implement project-related API endpoints and connect them to MongoDB.

## Required User Flow

```text
Login
 ↓
Dashboard
 ↓
Projects
 ↓
Create Project
 ↓
Project Workspace
 ↓
View / Edit Project
```

## Completion Criteria

* Dashboard is functional
* Project CRUD works
* Project data persists in MongoDB
* Project permissions work
* Project workspace is functional
* Project progress is displayed
* Responsive layouts work
* REST APIs work correctly
* Loading/error/empty states exist

---

# Milestone 3 — Tasks & Team Collaboration

## Objective

Turn project workspaces into functional collaboration spaces by implementing task management and project team management.

## Features

### Task Management

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

Task statuses:

```text
TODO
IN_PROGRESS
COMPLETED
```

Task priorities:

```text
LOW
MEDIUM
HIGH
```

Implement:

* [ ] Create task
* [ ] View tasks
* [ ] Edit task
* [ ] Delete task
* [ ] Assign task
* [ ] Change task status
* [ ] Change task priority
* [ ] Set task deadline
* [ ] Permission checks
* [ ] Member task updates

### Task Board

Implement a Kanban-style task board:

```text
TODO
────────────────
Task A
Task B


IN PROGRESS
────────────────
Task C
Task D


COMPLETED
────────────────
Task E
Task F
```

* [ ] Status-based task columns
* [ ] Visual priority indicators
* [ ] Assignee information
* [ ] Deadline information
* [ ] Task creation/edit dialogs
* [ ] Responsive task board

Drag-and-drop is optional and must not block milestone completion.

### Team Management

Project leaders manage project members.

Member fields:

```text
userId
projectId
role
joinedAt
```

Roles:

```text
LEADER
MEMBER
```

Implement:

* [ ] View project members
* [ ] Add members
* [ ] Remove members
* [ ] Display member roles
* [ ] Prevent duplicate membership
* [ ] Permission checks
* [ ] Leader management controls

### Project Permissions

Enforce:

```text
ADMIN
 ├── Manage projects
 ├── Manage users
 └── Manage project members

LEADER
 ├── Manage own project
 ├── Manage members
 ├── Create tasks
 ├── Assign tasks
 └── Update tasks

MEMBER
 ├── View projects
 ├── View tasks
 ├── Update assigned tasks
 └── Participate in project collaboration
```

## Required User Flow

```text
Project Workspace
      ↓
Add Members
      ↓
Create Tasks
      ↓
Assign Tasks
      ↓
Members Work on Tasks
      ↓
Update Status
      ↓
Project Progress Updates
```

## Completion Criteria

* Tasks persist in MongoDB
* Task CRUD works
* Task assignment works
* Task status updates work
* Task board works
* Members can be added/removed
* Duplicate membership is prevented
* Permissions are enforced
* Project progress reflects task completion
* Dashboard task information updates correctly

---

# Milestone 4 — Real-Time Collaboration & Notifications

## Objective

Add the real-time collaboration layer that differentiates DevForge from a basic project-management application.

## Features

### WebSocket Infrastructure

* [ ] Establish authenticated WebSocket connection
* [ ] Associate connections with users
* [ ] Associate connections with projects
* [ ] Validate project membership
* [ ] Handle connection/disconnection
* [ ] Handle reconnect scenarios
* [ ] Prevent unauthorized WebSocket access

### Project Chat

Each project receives a text-only real-time chat.

Implement:

* [ ] Project-specific chat
* [ ] Send messages
* [ ] Receive messages in real time
* [ ] Sender identification
* [ ] Message timestamps
* [ ] Message persistence
* [ ] Chat history
* [ ] Auto-update without page refresh
* [ ] Member-only access

Chat remains intentionally simple.

Do NOT implement:

* Images
* Videos
* File uploads
* Voice messages
* Reactions
* Video calls

### Notifications

Implement notification generation for important events.

Examples:

```text
You were added to DevForge Website.

You were assigned "JWT Authentication".

Aryan completed "Dashboard UI".

A new message was posted in DevForge Website.
```

Notification fields:

```text
id
userId
type
message
read
createdAt
```

Implement:

* [ ] Notification creation
* [ ] Notification listing
* [ ] Read/unread state
* [ ] Mark notification as read
* [ ] Notification count
* [ ] Real-time notification updates where practical
* [ ] Notification UI
* [ ] Empty notification state

### Real-Time Events

Support relevant events such as:

```text
Member Added
Task Assigned
Task Completed
New Chat Message
Notification Created
```

## Required User Flow

```text
User A
  ↓
Assigns Task
  ↓
User B receives Notification
  ↓
User B updates Task
  ↓
Project updates
  ↓
Project members see relevant changes

User A sends Chat Message
  ↓
WebSocket
  ↓
Project Members
  ↓
Message appears instantly
```

## Completion Criteria

* WebSocket connection works
* Project membership is enforced
* Chat messages arrive without refresh
* Messages are persisted
* Chat history loads correctly
* Notifications are generated correctly
* Notification state works
* Real-time updates do not break normal REST functionality
* Unauthorized users cannot access project chat

---

# Milestone 5 — Admin, Production Readiness & Delivery

## Objective

Complete the platform with administration, validation, security hardening, containerization, CI/CD, responsive testing, and final production-quality polish.

## Features

### Admin Dashboard

Admin users should have a simple administration area.

Implement:

* [ ] View users
* [ ] View projects
* [ ] Manage users
* [ ] Remove inappropriate projects
* [ ] Basic platform statistics
* [ ] Admin-only route protection
* [ ] Admin-only API authorization

Keep administration intentionally simple.

### Validation & Error Handling

Implement consistent handling for:

* [ ] Invalid input
* [ ] Missing required fields
* [ ] Unauthorized requests
* [ ] Forbidden actions
* [ ] Resource not found
* [ ] Duplicate resources
* [ ] Database failures
* [ ] Network failures
* [ ] WebSocket failures

Every API interaction should support:

```text
Loading
Success
Error
Empty
```

### UX Polish

Ensure:

* [ ] Confirmation before destructive actions
* [ ] Disabled buttons during requests
* [ ] Success feedback
* [ ] Error feedback
* [ ] Empty states
* [ ] Loading states
* [ ] Responsive navigation
* [ ] Responsive dashboards
* [ ] Responsive project workspace
* [ ] Responsive task board
* [ ] Responsive chat
* [ ] Mobile usability
* [ ] Tablet usability
* [ ] Desktop usability

### Security Review

Verify:

* [ ] Passwords are never stored in plain text
* [ ] JWT validation is enforced
* [ ] Authorization is enforced server-side
* [ ] Secrets use environment variables
* [ ] Protected endpoints reject unauthenticated requests
* [ ] Project permissions cannot be bypassed
* [ ] Admin endpoints are protected
* [ ] WebSocket authorization is enforced
* [ ] User input is validated

### Docker

Create production-ready containerization.

* [ ] Frontend Dockerfile
* [ ] Backend Dockerfile
* [ ] MongoDB service
* [ ] Docker Compose configuration
* [ ] Environment configuration
* [ ] Persistent MongoDB volume
* [ ] Inter-container networking
* [ ] Application startup verification

Expected architecture:

```text
Docker Compose
│
├── Frontend
│
├── Go Backend
│
└── MongoDB
```

### CI/CD

Implement GitHub Actions pipeline.

Pipeline should:

* [ ] Install dependencies
* [ ] Run frontend checks
* [ ] Run backend checks
* [ ] Run tests
* [ ] Build frontend
* [ ] Build backend
* [ ] Build Docker images
* [ ] Fail on build/test errors

### Final Verification

Verify the complete product flow:

```text
Register
 ↓
Login
 ↓
Dashboard
 ↓
Create Project
 ↓
Add Members
 ↓
Create Tasks
 ↓
Assign Tasks
 ↓
Update Task Status
 ↓
Real-Time Chat
 ↓
Notifications
 ↓
Project Completion
 ↓
Logout
```

## Definition of Done

The project is complete only when:

* [ ] Application compiles
* [ ] Frontend runs
* [ ] Backend runs
* [ ] MongoDB works
* [ ] Authentication works
* [ ] Authorization works
* [ ] REST APIs work
* [ ] Project management works
* [ ] Task management works
* [ ] Team management works
* [ ] WebSocket chat works
* [ ] Notifications work
* [ ] Admin functionality works
* [ ] Docker Compose works
* [ ] CI/CD pipeline works
* [ ] Responsive UI works
* [ ] Loading states exist
* [ ] Error states exist
* [ ] Empty states exist
* [ ] No obvious console errors exist
* [ ] No major TypeScript errors exist
* [ ] No PRD scope violations exist

---

# Milestone Dependency

Milestones must be completed sequentially.

```text
Milestone 1
Foundation & Secure Access
        ↓
Milestone 2
Dashboard & Project Management
        ↓
Milestone 3
Tasks & Team Collaboration
        ↓
Milestone 4
Real-Time Collaboration & Notifications
        ↓
Milestone 5
Admin, Production Readiness & Delivery
        ↓
PROJECT COMPLETE
```

Never implement a future milestone while the current milestone is incomplete.

---

# Milestone Completion Rule

A milestone is complete only when:

1. All mandatory requirements are implemented.
2. The functionality works end-to-end.
3. Existing functionality continues to work.
4. The UI follows `DESIGN.md`.
5. Backend authorization is enforced.
6. Loading, error, and empty states exist where applicable.
7. The application builds successfully.
8. The Reviewer has verified the milestone.
9. `review.md` contains `PASS`.

Only after these conditions are satisfied should the Memory Manager advance `memory.md` to the next milestone.

---

# Scope Protection

The following features are explicitly outside the project scope and must not be implemented:

* Git repository hosting
* Git commits
* Pull requests
* Code editor
* Code execution
* Video calls
* Voice calls
* AI code generation
* Payment systems
* File storage
* Advanced analytics
* Microservices architecture
* Kubernetes

The project should remain a **small, polished, reliable collaborative project-management platform**.

Priority:

**Simplicity → Functionality → Reliability → Demonstrability**
