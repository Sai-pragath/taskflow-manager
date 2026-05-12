# 🚀 TaskFlow — Task Management System

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A full-stack **Kanban-style task management system** with real-time collaboration via WebSockets, JWT authentication, analytics dashboards, and a premium dark-mode UI.

## ✨ Features

- **🔐 JWT Authentication** — Secure register/login with role-based access (Admin, Manager, Member)
- **📋 Kanban Board** — Drag-and-drop task management across 4 columns (Todo → In Progress → Review → Done)
- **⚡ Real-Time Updates** — WebSocket (STOMP/SockJS) pushes task changes to all connected clients instantly
- **📊 Analytics Dashboard** — Recharts-powered pie/bar charts for task status and priority distribution
- **🏗️ Project Management** — Create projects, add members, manage tasks per project
- **💬 Comments** — Task-level commenting system
- **🌙 Premium Dark UI** — Glassmorphism design system with gradients, animations, and Inter typography

## 🏗️ Architecture

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

## 🚀 Quick Start

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
# From the devops-pipeline directory
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/tasks/project/{id}` | Get tasks for project |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}/status` | Update task status |
| GET | `/api/tasks/project/{id}/analytics/status` | Task status counts |
| WS | `/ws` | WebSocket (STOMP) endpoint |

## 📈 Monitoring

- **Health**: `http://localhost:8080/actuator/health`
- **Metrics**: `http://localhost:8080/actuator/prometheus`
- **Prometheus**: See `devops-pipeline/monitoring/prometheus.yml`
- **Grafana**: Import dashboard ID `4701` for Spring Boot metrics

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.4, Spring Security 6, Spring Data JPA, WebSocket |
| Frontend | React 18, Vite, @hello-pangea/dnd, Recharts, Axios |
| Database | PostgreSQL 15, H2 (dev) |
| Auth | JWT (jjwt 0.11.5), BCrypt |
| DevOps | Docker, docker-compose, GitHub Actions, Kubernetes |
| Monitoring | Actuator, Micrometer, Prometheus, Grafana |

## 📁 Project Structure

```
task-management-system/
├── backend/
│   ├── src/main/java/com/taskmanager/
│   │   ├── config/       — Security, WebSocket config
│   │   ├── controller/   — REST endpoints
│   │   ├── dto/          — Request objects
│   │   ├── entity/       — JPA entities
│   │   ├── repository/   — Data access
│   │   ├── service/      — Business logic
│   │   └── util/         — JWT utilities
│   ├── Dockerfile
│   └── pom.xml
└── frontend/
    ├── src/
    │   ├── api/          — Axios API layer
    │   ├── components/   — KanbanBoard, TaskCard, Navbar
    │   ├── context/      — AuthContext
    │   └── pages/        — Login, Dashboard, Board, Analytics
    ├── Dockerfile
    └── package.json
```

## 📄 License

MIT
