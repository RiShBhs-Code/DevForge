# DevForge

### Build Together. Ship Better.

DevForge is a real-time collaborative project management platform for students and small development teams.

It brings **project management, task tracking, team collaboration, real-time communication, and notifications** into a single workspace.

---

## Features

* **Authentication & Authorization**

  * JWT-based authentication
  * Secure password hashing
  * Protected routes
  * Role-based access control

* **Project Management**

  * Create and manage projects
  * Project status and deadlines
  * Project-specific workspaces

* **Task Management**

  * Create, assign, update, and delete tasks
  * Task priorities and deadlines
  * Kanban-style task organization

* **Team Collaboration**

  * Add and remove project members
  * Project-specific roles and permissions

* **Real-Time Communication**

  * Project-based chat
  * WebSocket-powered messaging
  * Real-time notifications

* **Responsive Interface**

  * Desktop, tablet, and mobile support
  * Built with React and Tailwind CSS

* **Containerized Deployment**

  * Docker support
  * Docker Compose for local development

* **Automated CI/CD**

  * GitHub Actions for testing and builds

---

## Architecture

```text
┌─────────────────────────────────────────────┐
│              React + Vite + TypeScript      │
│                                             │
│       Tailwind CSS │ Zustand │ Router      │
└──────────────────────┬──────────────────────┘
                       │
                 REST / WebSocket
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                  Go Backend                 │
│                                             │
│   Chi │ JWT │ REST APIs │ WebSockets        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
                ┌──────────────┐
                │   MongoDB    │
                └──────────────┘
```

---

## Tech Stack

### Frontend

* [React](https://react.dev/)
* [Vite](https://vite.dev/)
* TypeScript
* [Tailwind CSS](https://tailwindcss.com/)
* React Router
* Zustand

### Backend

* Go
* Chi
* MongoDB Go Driver
* JWT
* bcrypt
* WebSockets

### Infrastructure

* Docker
* Docker Compose
* GitHub Actions

---

## Project Structure

```text
devforge/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── routes/
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   │
│   ├── internal/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── members/
│   │   ├── notifications/
│   │   ├── chat/
│   │   ├── middleware/
│   │   └── database/
│   │
│   ├── config/
│   ├── migrations/
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── .env.example
├── PRD.md
└── README.md
```

---

## Requirements

Before running DevForge locally, make sure you have:

* Node.js 20+
* npm
* Go 1.24+
* MongoDB 7+
* Git
* Docker
* Docker Compose

Verify the installations:

```bash
node --version
npm --version
go version
docker --version
docker compose version
```

---

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd devforge
```

### Configure Environment Variables

Create the required environment files using the provided examples.

#### Backend

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/devforge
JWT_SECRET=replace-with-a-secure-secret
CLIENT_URL=http://localhost:5173
```

#### Frontend

```env
VITE_API_URL=http://localhost:8080/api/v1
```

> Never commit `.env` files or production secrets to the repository.

---

## Running Locally

### Start MongoDB

Ensure MongoDB is running locally.

Then start the backend:

```bash
cd backend
go mod download
go run ./cmd/server
```

The API will be available at:

```text
http://localhost:8080
```

In another terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

The development application will be available at:

```text
http://localhost:5173
```

---

## Running with Docker

Docker Compose can be used to run the complete application stack.

From the project root:

```bash
docker compose up --build
```

This starts:

```text
Frontend
Backend
MongoDB
```

To stop the services:

```bash
docker compose down
```

To stop the services and remove persistent database volumes:

```bash
docker compose down -v
```

> `docker compose down -v` permanently removes the MongoDB Docker volume.

---

## Environment Variables

| Variable       | Service  | Description                     |
| -------------- | -------- | ------------------------------- |
| `PORT`         | Backend  | HTTP server port                |
| `MONGODB_URI`  | Backend  | MongoDB connection string       |
| `JWT_SECRET`   | Backend  | Secret used to sign JWTs        |
| `CLIENT_URL`   | Backend  | Frontend origin allowed by CORS |
| `VITE_API_URL` | Frontend | Backend API base URL            |

Production secrets should be provided through the deployment environment rather than committed to source control.

---

## API

The backend API is versioned under:

```text
/api/v1
```

### Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Projects

```http
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Tasks

```http
GET    /api/v1/projects/:id/tasks
POST   /api/v1/projects/:id/tasks
PUT    /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
```

### Members

```http
GET    /api/v1/projects/:id/members
POST   /api/v1/projects/:id/members
DELETE /api/v1/projects/:id/members/:userId
```

### Notifications

```http
GET   /api/v1/notifications
PATCH /api/v1/notifications/:id/read
```

---

## WebSockets

Project chat uses WebSockets for real-time communication.

Connection endpoint:

```text
/ws/projects/:projectId
```

Only authenticated members of the corresponding project should be allowed to establish a connection.

Example event:

```json
{
  "type": "message:new",
  "payload": {
    "message": "Backend API is ready"
  }
}
```

---

## Database

DevForge uses MongoDB.

Core collections include:

```text
users
projects
tasks
project_members
messages
notifications
```

Database access is handled by the official MongoDB driver for Go.

---

## Security

DevForge follows these security principles:

* Passwords are hashed using bcrypt.
* Authentication is handled using JWT.
* Protected resources require authentication.
* Authorization is enforced on the backend.
* Request payloads are validated.
* Secrets are provided through environment variables.
* CORS is explicitly configured.
* Sensitive user information is not returned unnecessarily.
* Frontend permission checks are treated only as a UX mechanism; backend authorization remains authoritative.

---

## Testing

### Backend

Run the Go test suite:

```bash
cd backend
go test ./...
```

### Frontend

Run linting:

```bash
cd frontend
npm run lint
```

Additional unit, integration, and end-to-end tests should be added as the application evolves.

---

## CI/CD

DevForge uses GitHub Actions to automate the development pipeline.

The CI pipeline is responsible for validating changes through automated checks such as:

```text
Push / Pull Request
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
```

Deployment steps depend on the target hosting environment and should be configured separately from the core application.

---

## Documentation

Additional project documentation:

* [`PRD.md`](./PRD.md) — Product requirements and functional specifications
* [`.env.example`](./.env.example) — Environment variable reference

---

## Contributing

Contributions are welcome.

Before submitting a change:

1. Create a feature branch.
2. Make focused changes.
3. Run the relevant tests and linting checks.
4. Ensure existing functionality remains intact.
5. Open a pull request with a clear description of the changes.

For larger changes, discuss the proposed approach before implementation.

---

## License

This project is licensed under the terms specified in the repository's license file.

If no license has been added yet, the project remains under the repository owner's default copyright.

---

## DevForge

**Build Together. Ship Better.**
