# TaskFlow — Smart Task Management System

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A full-stack **Kanban-style task management system** with real-time collaboration via WebSockets, JWT authentication, analytics dashboards, and a premium dark-mode UI — packed with unique productivity features like a built-in **Pomodoro Focus Timer**, **⌘K Command Palette**, **subtask checklists**, and an **activity timeline**.

---

## Features

### Core
- **JWT Authentication** — Secure register/login with role-based access (Admin, Manager, Member)
- **Kanban Board** — Drag-and-drop task management across 4 columns (Todo → In Progress → Review → Done)
- **Real-Time Updates** — WebSocket (STOMP/SockJS) pushes task changes to all connected clients instantly
- **Analytics Dashboard** — Recharts-powered pie/bar charts for task status and priority distribution
- **Project Management** — Create projects, add members, manage tasks per project
- **Comments** — Task-level commenting system

### Unique / Differentiating Features
- **⌘K Command Palette** — Spotlight-style search overlay to instantly navigate projects, boards, and analytics. Full keyboard navigation with fuzzy search.
- **Focus Timer (Pomodoro)** — Built-in productivity timer with 25/5/15 min work/break cycles, circular SVG progress ring, desktop notifications on completion, and session tracking.
- **Subtasks & Checklists** — Break tasks into sub-items with progress tracking. Click any task card to open a detail modal for managing checklists, editing descriptions, and changing priorities.
- **Task Assignment** — Fetch users dynamically and assign specific members to tasks with real-time card updates showing assignee initials.
- **Activity Timeline** — Real-time activity feed on the dashboard tracking task creation, status changes, project events, and logins with relative timestamps.
- **Password Strength Meter** — Live visual feedback during registration with animated strength bar (Weak → Excellent), inline validation hints, and password confirmation field.
- **Toast Notifications** — Global notification system (success/error/info/warning) with auto-dismiss progress bars, replacing all browser alerts.

### Premium UI / UX
- **Premium Dark UI** — Glassmorphism design system with gradients, glow effects, and Inter typography
- **Animated Particle Background** — 30 floating particles with pure CSS animations across all pages
- **Parallax Orb Animations** — Auth pages feature drifting gradient orbs with animated mesh grid pattern
- **Micro-Animations** — Button ripple effects, staggered card entrances, glow pulses, and smooth page transitions
- **Password Visibility Toggles** — Eye icon toggle on all password fields
- **Remember Me** — Persistent email storage on login page
- ** User Dropdown** — Profile info, role badge, and sign-out in the navbar
- **⌨ Keyboard Shortcuts** — `⌘K`/`Ctrl+K` for command palette, `Esc` to close modals

## Architecture

```
┌────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  React (Vite)  │────▶│  Spring Boot    │────▶│  PostgreSQL  │
│  Port: 5173    │     │  Port: 8080     │     │  Port: 5432  │
│                │◀────│                 │     │              │
│  @hello-pangea │ WS  │  JWT + Security │     │  taskdb      │
│  Recharts      │     │  WebSocket      │     │              │
│  Axios         │     │  Actuator       │     │              │
└────────────────┘     └─────────────────┘     └──────────────┘
```

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 15 (or use H2 in dev mode)

### Backend

```bash
cd backend

# Run with H2 (no PostgreSQL needed)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Run with PostgreSQL
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

Backend starts at `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

### Docker (Full Stack)

```bash
# Copy environment template and edit secrets
cp .env.example .env

# Start all services
docker-compose up --build

# (Optional) Start with monitoring stack
docker-compose --profile monitoring up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`
- Prometheus: `http://localhost:9090` (monitoring profile)
- Grafana: `http://localhost:3001` (monitoring profile)

### Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/postgres-secret.yml
kubectl apply -f k8s/postgres-deployment.yml
kubectl apply -f k8s/backend-configmap.yml
kubectl apply -f k8s/backend-deployment.yml
kubectl apply -f k8s/frontend-deployment.yml
kubectl apply -f k8s/ingress.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| DELETE | `/api/projects/{id}` | Delete project |
| GET | `/api/users` | List all users for task assignment |
| GET | `/api/tasks/project/{id}` | Get tasks for project |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| PUT | `/api/tasks/{id}/status` | Update task status |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/tasks/project/{id}/analytics/status` | Task status counts |
| GET | `/api/tasks/project/{id}/analytics/priority` | Task priority counts |
| WS | `/ws` | WebSocket (STOMP) endpoint |

## Monitoring

- **Health**: `http://localhost:8080/actuator/health`
- **Metrics**: `http://localhost:8080/actuator/prometheus`
- **Prometheus**: See `monitoring/prometheus.yml` — scrapes backend every 10s
- **Grafana**: Auto-provisioned dashboard at `http://localhost:3001` (admin/admin)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.4, Spring Security 6, Spring Data JPA, WebSocket |
| Frontend | React 18, Vite 5, @hello-pangea/dnd, Recharts, Axios |
| Database | PostgreSQL 15, H2 (dev) |
| Auth | JWT (jjwt 0.11.5), BCrypt |
| DevOps | Docker, docker-compose, GitHub Actions, Kubernetes |
| Monitoring | Actuator, Micrometer, Prometheus, Grafana |

## Project Structure

```
task-management-system/
├── .github/workflows/
│   └── ci-cd.yml           — GitHub Actions CI/CD pipeline
├── backend/
│   ├── src/main/java/com/taskmanager/
│   │   ├── config/         — Security, WebSocket, CORS config
│   │   ├── controller/     — REST endpoints (Auth, Project, Task)
│   │   ├── dto/            — Request/response DTOs
│   │   ├── entity/         — JPA entities (User, Project, Task, Comment)
│   │   ├── repository/     — Spring Data repositories
│   │   ├── service/        — Business logic layer
│   │   └── util/           — JWT utilities
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/            — Axios API layer with JWT interceptors
│   │   ├── components/
│   │   │   ├── CommandPalette  — ⌘K spotlight search
│   │   │   ├── FocusTimer      — Pomodoro timer widget
│   │   │   ├── KanbanBoard     — Drag-and-drop board
│   │   │   ├── Navbar          — Navigation with user dropdown
│   │   │   ├── Particles       — Animated background particles
│   │   │   ├── TaskCard        — Card with subtask progress
│   │   │   ├── TaskDetailModal — Full task editor with checklists
│   │   │   └── Toast           — Notification system
│   │   ├── context/
│   │   │   ├── AuthContext     — JWT auth state
│   │   │   ├── ToastContext    — Global toast notifications
│   │   │   └── ActivityContext — Activity tracking (localStorage)
│   │   └── pages/
│   │       ├── Login           — Sign in with remember me
│   │       ├── Register        — Sign up with password strength
│   │       ├── Dashboard       — Projects grid + activity timeline
│   │       ├── Board           — Kanban board view
│   │       └── Analytics       — Charts and stats
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── k8s/
│   ├── namespace.yml           — taskflow namespace
│   ├── postgres-secret.yml     — DB & JWT credentials
│   ├── postgres-deployment.yml — PostgreSQL + PVC + Service
│   ├── backend-configmap.yml   — Spring Boot config
│   ├── backend-deployment.yml  — Backend (2 replicas) + Service
│   ├── frontend-deployment.yml — Frontend (2 replicas) + Service
│   └── ingress.yml             — Nginx Ingress routing
├── monitoring/
│   ├── prometheus.yml          — Prometheus scrape config
│   └── grafana/provisioning/   — Datasource + dashboard auto-provisioning
├── docker-compose.yml          — Full-stack orchestration
├── .env.example                — Environment variable template
└── README.md
```

## Screenshots

### Login Page
Premium glassmorphism design with parallax orb animations, password visibility toggle, and remember me option.

### Dashboard
Project cards with staggered animations, stats grid, and real-time activity timeline.

### Kanban Board
Drag-and-drop columns with task cards showing subtask progress bars. Click any card to open the detail editor.

### Command Palette
Press `⌘K` / `Ctrl+K` to instantly search and navigate to any project or board.

### Focus Timer
Built-in Pomodoro timer with circular progress ring, work/break mode switching, and desktop notifications.

## License

MIT
